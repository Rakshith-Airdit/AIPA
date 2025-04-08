const { connectDB } = require("../lib/db-connect");
const { Users, Departments,
    RoleAssignment, userType,
    Vendors, ActivityLogs,
    AssetNetworks, DeviceManagement, Forms,
    FieldDetails, VersionManagement, FormCollection,
    RedFlagRules, DocumentUploads, AssetsExcelSheets,
    FsChunk, Projects } = cds.entities('Common');
const { IDP_USERNAME, IDP_PASSWORD, IDP_ENDPOINT, AZURE_CONNECTION_STRING: connectionString, AZURE_CONTAINER_NAME: containerName } = process.env;
const {
    buildDynamicQuery,
    uploadImageToAzure, checkBtpUserExists, deleteImageFromAzure,
    getUserType, isInternalEmail, isExternalEmail, sendEmail, DateFilter
} = require('../lib/helpers');
const axios = require("axios");

let db;

(async () => {
    db = await connectDB();
})();

async function createDeviceData(req) {
    try {
        const {
            UUID,
            departmentName,
            appVersion,
            isDeleted,
            requestedUser,
            deviceType,
            version,
            platform,
            MacAddress,
            Model,
            Manufacturer,
            fcmKey,
        } = req.data;

        const DeviceData = {
            UUID,
            departmentName,
            appVersion,
            isDeleted,
            requestedUser,
            lastUpdated: new Date(),
            deviceType,
            createdTime: new Date(),
            version,
            platform,
            status: "Pending",
            MacAddress,
            Model,
            Manufacturer,
            fcmKey,
        };

        // === Insert into DeviceData table ===
        await db.insert(DeviceData).into(DeviceManagement);
        console.log(`DeviceData created with UUID: ${UUID}`);

        // === Find department ID from departments table ===
        let department = null;
        if (departmentName) {
            const deptResult = await db.read(Departments)
                .where({ name: departmentName });

            if (deptResult.length > 0) {
                department = deptResult[0];
            }
        }

        // === Insert into activitylogs table ===
        const activityLogEntry = {
            formDescription: null,
            version: null,
            taskName: null,
            taskId: null,
            deviceModel: Model,
            source: null,
            formId: null,
            deviceUUID: UUID,
            username: null,
            adminname: null,
            formName: null,
            recordId: null,
            departmentId: department?.ID || null,
            activity: "New Device registered",
            timestamp: new Date(),
            departmentName,
            isDeleted: false
        };

        await db.insert(ActivityLogs).entries(activityLogEntry);

        return DeviceData;

    } catch (err) {
        console.error("Error inserting DeviceData: ", err);
        req.error(500, "Unable to insert data");
    }
}

async function getDeviceData(req) {
    try {
        // Get dynamic query parts from the helper.
        let { query, sort, pagination } = await buildDynamicQuery(req, []);

        // Enforce that we only retrieve non-deleted records.
        query.isDeleted = false;

        // Integrate search criteria if the $search parameter is provided.
        if (req.query.$search) {
            const searchTerm = req.query.$search;
            // Determine searchable fields from the SELECT columns, or fall back to defaults.
            let searchableFields = [];
            if (req.query.SELECT && req.query.SELECT.columns) {
                searchableFields = req.query.SELECT.columns.map(col => (col.ref ? col.ref[0] : col));
            } else {
                // Example defaults; adjust as necessary for your model.
                searchableFields = ['name', 'description'];
            }
            // Build search conditions using the "like" operator (HANA will interpret this as a wildcard search).
            const searchConditions = searchableFields.map(field => ({ [field]: { like: `%${searchTerm}%` } }));
            // Merge these conditions into the query under an OR clause.
            query.or = query.or ? query.or.concat(searchConditions) : searchConditions;
        }

        // Apply a default sort if none is provided.
        if (!sort || Object.keys(sort).length === 0) {
            sort = { createdTime: 'desc' };
        }
        // Execute the query using CAP's db.read() syntax.
        let result;
        if (pagination && pagination.top && (pagination.skip !== undefined)) {
            result = await db.read(DeviceManagement)
                .where(query)
                .orderBy(sort)
                .limit(pagination.top.val, pagination.skip);
        } else {
            result = await db.read(DeviceManagement)
                .where(query)
                .orderBy(sort);
        }

        // Execute a separate count query to obtain the total number of matching records.
        // The count method here returns the total number directly.
        const totalCount = (await db.read(DeviceManagement).where(query)).length;
        result.$count = totalCount;

        return result;
    } catch (err) {
        console.error("Error reading DeviceData", err);
        req.error(500, "Unable to read data");
    }
}

async function editDeviceData(req) {
    const params = req.params[0];
    const UUID = params.UUID;
    const requestedUser = params.requestedUser;
    const { status } = req.data;

    try {
        // === Read existing device by UUID and requestedUser ===
        const [device] = await db.read(DeviceManagement).where({ UUID, requestedUser });

        if (!device) {
            return req.reject(404, `DeviceData with UUID ${UUID} not found`);
        }

        // === Update device status and timestamp ===
        await db.update(DeviceManagement)
            .set({ status, lastUpdated: new Date() })
            .where({ ID: device.ID });

        console.log(`DeviceData updated with UUID: ${UUID}`);
        const activityMessage = "Device " + status;

        const deviceModel = device.Model || null;
        const departmentName = device.departmentName || null;

        // === Fetch department ID ===
        let departmentId = null;
        if (departmentName) {
            const [dept] = await db.read(Departments).where({ name: departmentName });
            departmentId = dept?.ID || null;
        }

        // === Insert into activitylogs ===
        await db.insert(ActivityLogs).entries({
            formDescription: null,
            version: null,
            taskName: null,
            taskId: null,
            deviceModel: deviceModel,
            deviceUUID: UUID,
            source: null,
            formId: null,
            username: null,
            adminname: null,
            formName: null,
            recordId: null,
            departmentId: departmentId,
            activity: activityMessage,
            timestamp: new Date(),
            departmentName: departmentName,
            isDeleted: false,
        });

        return { status: "success" };
    } catch (err) {
        console.error("Error updating DeviceData: ", err);
        req.error(500, "Unable to update data");
    }
}

async function deleteDeviceData(req) {
    const UUID = req.params[0].UUID;

    try {
        // === Update isDeleted flag ===
        const result = await db.update(DeviceManagement)
            .set({ isDeleted: true })
            .where({ UUID });

        if (result === 0) {
            return req.reject(404, `DeviceData with UUID ${UUID} not found`);
        }

        // === Fetch updated device info for logging ===
        const device = await db.read(DeviceManagement).where({ UUID }).limit(1);
        const deviceModel = device?.Model || null;
        const departmentName = device?.departmentName || null;

        // === Get department ID if available ===
        let departmentId = null;
        if (departmentName) {
            const dept = await db.read(Departments).where({ name: departmentName }).limit(1);
            departmentId = dept?.ID || null;
        }

        // === Insert into activitylogs ===
        await db.insert(ActivityLogs).entries({
            formDescription: null,
            version: null,
            taskName: null,
            taskId: null,
            deviceModel: deviceModel,
            deviceUUID: UUID,
            source: null,
            formId: null,
            username: null,
            adminname: null,
            formName: null,
            recordId: null,
            departmentId,
            activity: "Device Deleted",
            timestamp: new Date(),
            departmentName,
            isDeleted: false,
        });

        console.log(`DeviceData deleted with UUID: ${UUID}`);
        return { status: "success" };

    } catch (err) {
        console.error("Error deleting DeviceData: ", err);
        req.error(500, "Unable to delete data");
    }
}

async function getDeviceActivities(req) {
    try {
        // Get dynamic query parts (where, order, pagination) from helper
        let { query, sort, pagination } = await buildDynamicQuery(req, []);

        // Always filter out deleted records
        query.isDeleted = false;

        // Enforce that deviceUUID must exist
        query.deviceUUID = { '!=': null };

        // Add time-based filtering if present
        if (req.data?.fromDate && req.data?.toDate) {
            const fromDate = new Date(req.data.fromDate);
            fromDate.setHours(0, 0, 0, 0);

            const toDate = new Date(req.data.toDate);
            toDate.setHours(23, 59, 59, 999);

            query.timestamp = { between: [fromDate, toDate] };
        }

        // Default sort by timestamp descending
        if (!sort || Object.keys(sort).length === 0) {
            sort = { timestamp: 'desc' };
        }

        // Fetch matching activity logs
        let result;
        if (pagination?.top && pagination.skip !== undefined) {
            result = await db.read(ActivityLogs)
                .where(query)
                .orderBy(sort)
                .limit(pagination.top.val, pagination.skip);
        } else {
            result = await db.read(ActivityLogs)
                .where(query)
                .orderBy(sort);
        }

        // Get total count
        const totalCount = (await db.read(ActivityLogs).where(query)).length;
        result.$count = totalCount;

        return result;

    } catch (err) {
        console.error("Error reading DeviceActivity:", err);
        req.error(500, "Unable to read activity data");
    }
}

module.exports = {
    createDeviceData,
    getDeviceData,
    editDeviceData,
    deleteDeviceData,
    getDeviceActivities
}