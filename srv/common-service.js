// const { db } = global;
// const fileUpload = require('express-fileupload');
const cds = require("@sap/cds");
const { connectDB, closeDB } = require("../lib/db-connect");
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
const env = require("dotenv").config();

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

const { getUserCount, getAllUserType,
    getAllDepartmentsAndUserTypes,
    getUserAttributes, getAllVendorsAndAdmins,
    getUsersForValueHelp, getUsersAndDepartmentsValueHelp,
    getDepartmentsValueHelp, getModifiedDepartmentsValueHelp,
    getAdministratorsValueHelp, getDocumentUploads,
    deleteDocumentUploaded, getAllDownloadTemplates, createDownloadTemplate,
    getAllContractors } = require('../controller/commonController')

const { createBTPUser, getBTPUser, editBTPUser } = require('../controller/btpUserController')

const { getVendors, createVendor, editVendor } = require('../controller/vendorController')

const { getAdministrators, createAdministrator,
    editAdministrator, deleteAdministrator } = require('../controller/administratorController')

const { createUser, editUser, deleteUser } = require('../controller/userManagementController')

const { createDepartment, getDepartments, editDepartment, deleteDepartment } = require('../controller/departmentController')

const { getAllActivities, createActivity, editActivity, deleteActivity } = require('../controller/activityController')

const { createRedFlagRule, getAllRedFlagRules, editRedFlagRule, deleteRedFlagRule } = require('../controller/redFlagRuleController')

const { createFieldUser, getAllFieldUsers, updateFieldUser, deleteFieldUser } = require('../controller/fieldUserController');

const { createDeviceData, getDeviceData, editDeviceData, deleteDeviceData, getDeviceActivities } = require('../controller/deviceController');

const { getAllProjects, createProject, getDetailedProjectInsights } = require("../controller/projectController");


async function getSteelCompletion(deptId, projectIds) {
    if (deptId === "All") {
        const departments = await cds.run(SELECT.from(Departments).where({ isDeleted: false }));
        const results = [];

        for (const dept of departments) {
            const projects = await cds.run(SELECT.from(Projects).where({
                departmentId: dept.ID,
                equipmentType: 'Steel',
                isDeleted: false
            }));

            const projectIds = projects.map(p => p.ID);
            if (projectIds.length === 0) {
                results.push({ project: dept.name, value: 0 });
                continue;
            }

            const backfillSum = await cds.run(SELECT.one.from(ActivityBackfilling).columns(
                { sum: { sectionLength: 'sum' } }
            ).where(`projectId in`, projectIds));

            const crossingSum = await cds.run(SELECT.one.from(ActivityCrossings).columns(
                { sum: { crossingLength: 'sum' } }
            ).where(`projectId in`, projectIds));

            const totalLength = projects.reduce((sum, p) => sum + (p.projectlength || 0), 0) * 1000;
            const backfill = parseFloat(backfillSum.sum || 0);
            const crossing = parseFloat(crossingSum.sum || 0);
            const percentage = totalLength === 0 ? 0 : (((backfill + crossing) / totalLength) * 100).toFixed(2);

            results.push({ project: dept.name, value: parseFloat(percentage) });
        }
        return results;
    } else {
        // Specific department logic
        const projects = await cds.run(SELECT.from(Projects).where({
            departmentId: deptId,
            equipmentType: 'Steel',
            isDeleted: false,
            ID: { in: projectIds }
        }));

        const results = [];
        for (const project of projects) {
            const backfillSum = await cds.run(SELECT.one.from(ActivityBackfilling).columns(
                { sum: { sectionLength: 'sum' } }
            ).where({ projectId: project.ID }));

            const crossingSum = await cds.run(SELECT.one.from(ActivityCrossings).columns(
                { sum: { crossingLength: 'sum' } }
            ).where({ projectId: project.ID }));

            const totalLength = (project.projectlength || 0) * 1000;
            const backfill = parseFloat(backfillSum.sum || 0);
            const crossing = parseFloat(crossingSum.sum || 0);
            const percentage = totalLength === 0 ? 0 : (((backfill + crossing) / totalLength) * 100).toFixed(2);

            results.push({ project: project.name, value: parseFloat(percentage) });
        }
        return results;
    }
}

async function getMdpeCompletion(deptId, projectIds) {
    if (deptId === "All") {
        const departments = await cds.run(SELECT.from(Departments).where({ isDeleted: false }));
        const results = [];

        for (const dept of departments) {
            const projects = await cds.run(SELECT.from(Projects).where({
                departmentId: dept.ID,
                equipmentType: 'MDPE',
                isDeleted: false
            }));

            const projectIds = projects.map(p => p.ID);
            if (projectIds.length === 0) {
                results.push({ project: dept.name, value: 0 });
                continue;
            }

            const coilSum = await cds.run(SELECT.one.from(MDPEPipe).columns(
                { sum: { consumedLength: 'sum' } }
            ).where(`projectId in`, projectIds));

            const totalLength = projects.reduce((sum, p) => sum + (p.projectlength || 0), 0) * 1000;
            const consumed = parseFloat(coilSum.sum || 0);
            const percentage = totalLength === 0 ? 0 : (((consumed) / totalLength) * 100).toFixed(2);

            results.push({ project: dept.name, value: parseFloat(percentage) });
        }
        return results;
    } else {
        const projects = await cds.run(SELECT.from(Projects).where({
            departmentId: deptId,
            equipmentType: 'MDPE',
            isDeleted: false,
            ID: { in: projectIds }
        }));

        const results = [];
        for (const project of projects) {
            const coilSum = await cds.run(SELECT.one.from(MDPEPipe).columns(
                { sum: { consumedLength: 'sum' } }
            ).where({ projectId: project.ID }));

            const totalLength = (project.projectlength || 0) * 1000;
            const consumed = parseFloat(coilSum.sum || 0);
            const percentage = totalLength === 0 ? 0 : (((consumed) / totalLength) * 100).toFixed(2);

            results.push({ project: project.name, value: parseFloat(percentage) });
        }
        return results;
    }
}

async function getGADelayedProjects(body) {
    let projIds = JSON.parse(body.projectIds);
    let projIdString = projIds.map(s => `'${s}'`).join(',');

    try {
        const tx = await cds.transaction();

        // SQL Query for HANA DB to calculate delayed projects
        const sqlQuery = `
        SELECT p.shortname, p.name, 
               DATEDIFF(DAY, TO_DATE(p.estimatedEndDate, 'YYYY-MM-DD'), TO_DATE(p.endDate, 'YYYY-MM-DD')) AS daysCount,
               p.departmentId, d.name AS department_name
        FROM "Projects" p
        LEFT JOIN "Departments" d ON p.departmentId = d.id
        WHERE p.isDeleted = 'false' AND p.id IN (${projIdString})
      `;

        const result = await tx.run(sqlQuery);

        if (result && result.length !== 0) {
            const formattedData = result.map((row) => ({
                department: row.department_name,
                value: row.daysCount > 0 ? row.daysCount : 0
            }));
            return { data: formattedData, message: 'Data found', status: 200 };
        } else {
            return { message: 'No Data found', status: 204 };
        }
    } catch (err) {
        console.log("Error fetching delayed projects:", err);
        return { status: 400, data: "Internal Server Error in Delayed Projects" };
    }
}

module.exports = cds.service.impl(async (srv) => {
    const db = await connectDB();
    // const tables = await db.model.definitions;

    srv.on("READ", "UserCount", getUserCount)

    srv.on("READ", "UserAttributes", getUserAttributes);

    srv.on("READ", "AllUserType", getAllUserType);

    srv.on("READ", "DepartmentDisplay", getAllDepartmentsAndUserTypes);

    srv.on("CREATE", "BTPUser", createBTPUser);

    srv.on("READ", "BTPUser", getBTPUser);

    srv.on("PUT", "BTPUser", editBTPUser);

    srv.on("CREATE", "Vendors", createVendor);

    srv.on("READ", "Vendors", getVendors);

    srv.on("PUT", "Vendors", editVendor);

    srv.on("READ", "Administrators", getAdministrators);

    srv.on("CREATE", "Administrators", createAdministrator);

    srv.on("PUT", "Administrators", editAdministrator);

    srv.on("DELETE", "Administrators", deleteAdministrator);

    //26-03-2025 - R0421
    srv.on("CREATE", "UserManagement", createUser);

    srv.on("READ", "UserManagement", async (req) => {
        // const users = await db.run(SELECT.from(Users))
        const users = await db.read(Users);
        return users;
    });

    srv.on("PUT", "UserManagement", editUser);

    srv.on("DELETE", "UserManagement", deleteUser);

    srv.on("READ", "GetVendorsAndAdmins", getAllVendorsAndAdmins);

    srv.on("READ", "UserManagementName", getUsersForValueHelp);

    srv.on("READ", "DepartmentValueHelp", getUsersAndDepartmentsValueHelp);

    srv.on("READ", "Departmentforvaluehelp1", getDepartmentsValueHelp);

    srv.on("READ", "Departmentforvaluehelp", getModifiedDepartmentsValueHelp);

    srv.on("CREATE", "Departments", createDepartment);

    srv.on("READ", "Departments", getDepartments);

    srv.on("PUT", "Departments", editDepartment);

    srv.on("DELETE", "Departments", deleteDepartment);

    srv.on("READ", "AdministratorName", getAdministratorsValueHelp);

    srv.on("READ", "Activity", getAllActivities);

    srv.on("CREATE", "Activity", createActivity);

    srv.on("PUT", "Activity", editActivity);

    srv.on("DELETE", "Activity", deleteActivity);

    //Problem
    srv.on("READ", "ActivityFieldDetails", async (req) => {
        try {
            const { query, sort, pagination } = await buildDynamicQuery(req, ["createdTime", "formId"]);
            const formId = query.formId || null;
            const formsData = await db.read(Forms).where({ ID: formId });
            if (!formId) {
                console.warn("No formId found in the query, skipping formData retrieval.");
            }

            let skeletonData;

            if (formId) {
                skeletonData = await db.read(FieldDetails)
                    .where({ formId_ID: formId })
                    .orderBy(sort)
                    .limit(pagination.top.val, pagination.skip);
            } else {
                skeletonData = await db.read(FieldDetails)
                    .orderBy(sort)
                    .limit(pagination.top.val, pagination.skip);

                return skeletonData;
            }

            let formData = {};
            if (formId) {
                let activityData = await db.read(Forms).where({ ID: formId, typeOfForm: "ActivityForm" });
                if (activityData && activityData.length > 0) {
                    formData = activityData[0];
                } else {
                    let assetsData = await db.read(Forms).where({ ID: formId, typeOfForm: "ActivityForm" });
                    if (assetsData && assetsData.length > 0) {
                        formData = assetsData[0];
                    }
                }
            }

            // Build final result object.
            const formattedDocuments = {
                formData,
                skeletonData
            };

            // Retrieve total count of matching FieldDetails records.
            const totalCount = (await db.read(FieldDetails).where(formId ? { formId } : {})).length;
            formattedDocuments["$count"] = totalCount;

            return formattedDocuments;
        } catch (err) {
            console.error("Error while reading documents from HANA DB:", err.message);
            req.error(500, "Unable to fetch data from the database. Please try again later.");
            return [];
        }
    });

    //Problem
    srv.on("CREATE", "ActivityFieldDetails", async (req) => {
        try {
            const data = req.data;
            const formdbValue = { ...data };

            const FormSkeleton = JSON.parse(data.FormSkeleton);
            data.FormSkeleton = FormSkeleton;
            const formSkeletonLevelChanges = JSON.parse(data.formSkeletonLevelChanges);

            delete formdbValue.skeleton;
            delete formdbValue.message;
            delete formdbValue.status;
            delete formdbValue.formSkeletonLevelChanges;
            delete formdbValue.FormSkeleton;
            delete formdbValue.isWholeSkeleton;
            delete formdbValue.isCreateNewForm;
            delete formdbValue.lastModifiedDate;
            delete formdbValue.basicLevelChanges;
            delete formdbValue.formSkeletonLevelChanges;
            delete formdbValue.derivedFieldVersion;
            delete formdbValue.FormSkeleton;

            formdbValue.createdTime = new Date();
            formdbValue.objectType = "Steel";

            const existingForms = await db.read(Forms).where({
                name: formdbValue.name,
                isVisible: true
            });

            if (existingForms && existingForms.length > 0) {
                return { message: "Forms already exists", status: 208 };
            }

            if (formdbValue.__v) {
                delete formdbValue.__v;
            }

            // === Inlined mergeDataWithSchema ===
            const mergedResult = {};
            for (const key in dbData.ActivityForm) {
                mergedResult[key] = formdbValue.hasOwnProperty(key) ? formdbValue[key] : dbData.ActivityForm[key];
            }

            const insertResult = await db.insert(Forms).entries(mergedResult);
            const formid = insertResult.insertedId || mergedResult.ID;

            let position = 1;
            for (const widget of FormSkeleton) {
                const widgetClone = JSON.parse(JSON.stringify(widget));
                delete widgetClone["_id"];
                widgetClone.formId = formid;
                widgetClone.id = widget.id;
                widgetClone.position = position++;
                await db.insert("FieldDetails").entries(widgetClone);
            }

            data.formId = formid;
            data.version = 1;
            data.formSkeletonLevelChanges = formSkeletonLevelChanges;
            data.isCreate = true;
            await db.insert(VersionManagement).entries(data);

            // === Inlined activityLogForForm ===
            await db.insert(ActivityLogs).entries({
                formId: formdbValue.ID || formid,
                formName: formdbValue.name,
                formType: formdbValue.formType,
                activity: data.formType + " Created",
                createdTime: new Date()
            });

            const sourceRecords = await db.read(Forms);
            for (const record of sourceRecords) {
                const recordFormId = record.ID || record._id;
                const objectType = record.objectType || "";
                const type = record.type || "";
                const collectionName = objectType + record.name.replace(/[^a-zA-Z0-9]/g, '');

                const existingRecord = await db.read(FormCollection).where({ formId: recordFormId });
                if (!existingRecord || existingRecord.length === 0) {
                    const newRecord = {
                        formId: recordFormId,
                        objectType: objectType,
                        type: type,
                        collectionName: collectionName
                    };
                    await db.insert(FormCollection).entries(newRecord);
                    console.log(`Inserted new record with formId: ${recordFormId}`);
                } else {
                    console.log(`Record with formId: ${recordFormId} already exists, skipping.`);
                }
            }

            console.log("Processing complete.");
            return {
                status: 200,
                message: "Form created successfully",
                formId: formid.toString()
            };
        } catch (error) {
            console.error("Error during form creation: ", error);
            return { message: "Something went wrong", status: 500 };
        }
    });

    //Problem
    srv.on("PUT", "ActivityFieldDetails", async (req) => {
        try {
            let updateForm = req.data;
            const formId = updateForm.formId;
            const skeleton = JSON.parse(updateForm.FormSkeleton);
            const widgetsToBeAdded = JSON.parse(updateForm.formSkeletonLevelChanges);
            const updateDataInForm = JSON.parse(updateForm.formUpdate);
            const isWholeSkeleton = updateForm.isWholeSkeleton;
            const isCreateNewForm = updateForm.isCreateNewForm;
            const newFormName = updateForm.newFormName;

            updateForm.formSkeletonLevelChanges = widgetsToBeAdded;
            updateForm.formId = formId;

            const versionManage = {
                ...updateDataInForm,
                formSkeletonLevelChanges: widgetsToBeAdded,
                FormSkeleton: skeleton,
                ...(updateForm.lastModifiedBy && { lastModifiedBy: updateForm.lastModifiedBy })
            };

            // Clean unwanted props
            delete updateForm.skeleton;
            delete updateForm.message;
            delete updateForm.status;
            delete updateForm.FormSkeleton;
            delete updateForm.isWholeSkeleton;
            delete updateForm.isCreateNewForm;

            // === Update ActivityForm ===
            const result = await db.update(Forms)
                .set(updateDataInForm)
                .where({ ID: formId });

            if (result === 0) {
                return { status: 204, message: "No data found" };
            }

            // === Handle FieldDetails Update ===
            if (isWholeSkeleton) {
                // Delete existing widgets
                await db.delete(FieldDetails).where({ formId });

                // Insert all widgets again
                const fieldInsertEntries = skeleton.map(widget => {
                    const cloned = { ...widget };
                    delete cloned._id;
                    return {
                        ...cloned,
                        formId,
                    };
                });
                await db.insert(FieldDetails).entries(fieldInsertEntries);
            }

            // === Handle Updated Fields ===
            if (!isWholeSkeleton && widgetsToBeAdded.update?.length > 0) {
                for (const widget of widgetsToBeAdded.update) {
                    const updatedWidget = skeleton.find(w => w.id === widget.id);
                    if (updatedWidget) {
                        const cloned = { ...updatedWidget };
                        delete cloned._id;
                        await db.update(FieldDetails)
                            .set(cloned)
                            .where({ id: cloned.id, formId });
                    }
                }
            }

            // === Create New Form Logic ===
            if (isCreateNewForm) {
                versionManage.createdTime = new Date();
                delete versionManage.lastUpdatedDate;
                versionManage.createdBy = updateForm.createdBy;
                versionManage.name = newFormName;
                versionManage.isCopy = true;

                updateForm.name = newFormName;
                req.data.name = newFormName;

                const newFormInsert = await db.insert(Forms).entries(updateForm);
                const newFormId = newFormInsert[0].ID;

                const clonedWidgets = skeleton.map(widget => {
                    const cloned = { ...widget };
                    delete cloned._id;
                    return {
                        ...cloned,
                        formId: newFormId
                    };
                });
                await db.insert(FieldDetails).entries(clonedWidgets);

                versionManage.formId = newFormId;
                await db.insert(VersionManagement).entries(versionManage);

                return {
                    status: 200,
                    message: `${req.data.formType.charAt(0).toUpperCase()}${req.data.formType.slice(1)} Created successfully`,
                    formId: newFormId
                };
            } else {
                // === Update Existing Version Info ===
                versionManage.isUpdate = true;
                versionManage.formId = formId;

                await db.insert(VersionManagement).entries(versionManage);

                return {
                    status: 200,
                    message: `${req.data.formType.charAt(0).toUpperCase()}${req.data.formType.slice(1)} updated successfully`,
                    formId: formId
                };
            }
        } catch (err) {
            console.error("ActivityFormCreation error:", err);
            return { status: 500, message: "Something went wrong" };
        }
    });

    srv.on("CREATE", "RedFlagRule", createRedFlagRule);

    srv.on("READ", "RedFlagRule", getAllRedFlagRules);

    srv.on("PUT", "RedFlagRule", editRedFlagRule);

    srv.on("DELETE", "RedFlagRule", deleteRedFlagRule);

    srv.on("READ", "Assets", async (req) => {
        try {
            // 1. Build dynamic query, sort, and pagination settings using your helper.
            const { query, sort, pagination } = await buildDynamicQuery(req, ["name"]);

            // 2. Remove any unwanted filter (e.g. isDeleted) if the AssetsForm entity doesn't have it.
            if (query.hasOwnProperty("isDeleted")) {
                delete query.isDeleted;
            }


            // 3. Inline search query logic (converted to CAP style):
            let additionalFilters = {};

            if (req.query.$search) {
                console.log("searching...");
                const columns = req.query.SELECT?.columns || [];
                // Parse the search term (assuming it's provided as JSON-encoded string)
                const searchTerm = JSON.parse(req.query.$search) || "";
                const searchableFields = columns.map(col => (col.ref ? col.ref[0] : col));
                // Build search conditions using CAP syntax (using the 'contains' operator)
                const searchConditions = searchableFields.map(field => ({
                    [field]: { contains: searchTerm, ignoreCase: true }
                }));
                // In CAP/HANA, use "or" to combine conditions.
                additionalFilters.or = searchConditions;
            }

            query.typeOfForm = "AssetsForm"

            // 4. Merge the dynamic query with the additional search filters.
            const finalQuery = { ...query, ...additionalFilters };

            // 5. Execute the query using CAP/HANA APIs against the AssetsForm entity.
            let documents = await db.read(Forms)
                .where(finalQuery)
                .orderBy(sort)
                .limit(pagination.top.val, pagination.skip);

            // 6. Format the results: alias the key field as "id".
            const result = documents.map(doc => ({
                id: doc.ID || doc._id, // Adjust according to your CDS model key
                ...doc
            }));

            // 7. Retrieve total count for OData compatibility.
            const totalCount = (await db.read(Forms).where(finalQuery)).length;
            result["$count"] = totalCount;

            return result;
        } catch (err) {
            console.error("Error reading documents from HANA DB", err);
            req.error(500, "Unable to fetch data");
            return [];
        }
    });

    srv.on("READ", "AssetFieldDetails", async (req) => {
        try {
            // Build dynamic query from the request using your helper.
            // Include "formId" in defaultFields so that it appears in the query if provided.
            const { query, sort, pagination } = await buildDynamicQuery(req, ["formId"]);
            // Retrieve skeleton data from FieldDetails.
            // If formId is provided, filter by it; otherwise, read all.
            let skeletonData;
            if (query.formId) {
                skeletonData = await db.read(FieldDetails)
                    .where({ formId: query.formId })
                    .orderBy({ position: "desc" });
            } else {
                skeletonData = await db.read(FieldDetails)
                    .orderBy({ position: "desc" });
            }

            // Retrieve form data: first try Activityforms; if not found, try AssetsForm.
            let formData = {};
            if (query.formId) {
                const activityData = await db.read(Forms).where({ ID: query.formId, typeOfForm: "Activityforms" });
                if (activityData && activityData.length > 0) {
                    formData = activityData[0];
                } else {
                    const assetsData = await db.read(Forms).where({ ID: query.formId, typeOfForm: "AssetsForm" });
                    if (assetsData && assetsData.length > 0) {
                        formData = assetsData[0];
                    }
                }
            } else {
                console.warn("No formId found in the query, skipping formData retrieval.");
            }

            // Build the final result object.
            const result = {
                formData: formData || {},
                skeletonData: skeletonData,
                "$count": skeletonData.length
            };

            return result;
        } catch (err) {
            console.error("Error reading documents from HANA DB:", err.message);
            req.error(500, "Unable to fetch data from the database. Please try again later.");
            return [];
        }
    });

    srv.on("READ", "ActivityAssetPreview", async (req) => {
        try {
            // Build dynamic query, sort, and pagination from the request.
            const { query, sort, pagination } = await buildDynamicQuery(req, []);

            // Convert "form" filter to "formId" if present.
            if (query.form) {
                query.formId = query.form;
                delete query.form;
            }

            // Add a filter for "type" to exclude unwanted values.
            // In CAP/HANA you can use "not in" to filter out certain values.
            query.type = {
                "not in": [
                    "dynamicdropdown",
                    "camera",
                    "video",
                    "heading",
                    "map",
                    "sensors",
                    "break",
                    "table",
                    "signature",
                    "barcode",
                    "time"
                ]
            };

            // Execute the query using CAP/HANA APIs against the FieldDetails entity.
            let preview;
            if (req.query.$skip && req.query.$top) {
                const skip = parseInt(req.query.$skip, 10);
                const top = parseInt(req.query.$top, 10);
                preview = await db.read(FieldDetails)
                    .where(query)
                    .orderBy(sort)
                    .limit(top, skip);
            } else {
                preview = await db.read(FieldDetails)
                    .where(query)
                    .orderBy(sort);
            }

            // Format the results (e.g. simply spread the document).
            const formattedDocuments = preview.map(doc => ({ ...doc }));
            formattedDocuments["$count"] = preview.length;

            return formattedDocuments;
        } catch (err) {
            console.error("Error reading documents from HANA DB:", err.message);
            req.error(500, "Unable to fetch data");
            return [];
        }
    });

    srv.on("PUT", "AssetFieldDetails", async (req) => {
        try {
            // ===== Data Preparation =====
            let formId = req.data.formId; // Assume formId is provided as a UUID string.
            let updateForm = { ...req.data };

            // Parse JSON strings for the skeleton and level changes.
            const skeleton = JSON.parse(updateForm.FormSkeleton);
            updateForm.FormSkeleton = skeleton;
            const widgetsToBeAdded = JSON.parse(updateForm.formSkeletonLevelChanges);
            const isWholeSkeleton = updateForm.isWholeSkeleton;
            const isCreateNewForm = updateForm.isCreateNewForm;
            updateForm.formId = formId;
            const updateDataInForm = JSON.parse(updateForm.formUpdate);

            // Prepare version management data (for later use).
            let versionManage = {
                ...updateDataInForm,
                formSkeletonLevelChanges: widgetsToBeAdded,
                FormSkeleton: skeleton
            };
            if (updateForm.lastModifiedBy) {
                versionManage.lastModifiedBy = updateForm.lastModifiedBy;
            }
            const newFormName = updateForm.newFormName;

            // Clean up unwanted properties.
            delete updateForm.skeleton;
            delete updateForm.message;
            delete updateForm.status;
            delete updateForm.formSkeletonLevelChanges;
            delete updateForm.FormSkeleton;
            delete updateForm.isWholeSkeleton;
            delete updateForm.isCreateNewForm;
            delete updateForm.lastModifiedDate;
            delete updateForm.basicLevelChanges;
            delete updateForm.formSkeletonLevelChanges;
            delete updateForm.derivedFieldVersion;
            delete updateForm.FormSkeleton;

            // Set additional metadata.
            updateForm.createdTime = new Date();
            updateForm.objectType = "Steel";

            // ===== Update the Form Record in AssetsForm =====
            const formUpdateResult = await db.update(Forms)
                .set(updateDataInForm)
                .where({ ID: updateForm.formId, typeOfForm: "AssetsForm" });

            if (!formUpdateResult || formUpdateResult.modifiedCount === 0) {
                return { status: 204, message: "No data found" };
            }

            // ===== Handle Skeleton Updates =====
            if (isWholeSkeleton) {
                // Delete existing fields for this form from FieldDetails.
                const deleteRes = await db.delete(FieldDetails).where({ formId: updateForm.formId });
                // (Assume deletion succeeded; if needed, you can check deleteRes for errors.)
                // Insert each widget from the skeleton into FieldDetails.
                let position = 1;
                for (const widget of skeleton) {
                    // Deep clone the widget.
                    const widgetClone = JSON.parse(JSON.stringify(widget));
                    delete widgetClone["_id"];
                    widgetClone.formId = updateForm.formId;
                    widgetClone.id = widget.id;
                    widgetClone.position = position++;
                    await db.insert(FieldDetails).entries(widgetClone);
                }
            } else {
                // Inline updateFields logic for widgetsToBeAdded.update.
                if (widgetsToBeAdded.update && widgetsToBeAdded.update.length > 0) {
                    for (const widget of widgetsToBeAdded.update) {
                        if (widget._id) {
                            // If _id exists, update the field record.
                            const widgetId = widget._id; // assume it is already in the proper format.
                            delete widget._id;
                            await db.update(FieldDetails)
                                .set(widget)
                                .where({ ID: widgetId, formId: updateForm.formId });
                        } else {
                            // Otherwise, insert a new field record.
                            widget.formId = updateForm.formId;
                            await db.insert(FieldDetails).entries(widget);
                        }
                    }
                }
            }

            // ===== Handle Form Version Management =====
            let versionRes;
            if (isCreateNewForm) {
                // Inline createForm logic:
                // Check if a visible form with the same name already exists.
                const existingForms = await db.read(Forms).where({ name: updateForm.name, typeOfForm: "AssetsForm", isVisible: true });
                if (existingForms && existingForms.length > 0) {
                    return { status: 208, message: "Forms already exist" };
                }
                // For inlining, we assume mergedResult is simply updateForm (or apply your mergeDataWithSchemaCreateForm logic here).
                const mergedResult = updateForm;
                const insertResult = await db.insert(Forms).entries(mergedResult);
                const newFormId = insertResult.insertedId;
                // Insert new fields from skeleton for the new form.
                for (const widget of skeleton) {
                    const widgetClone = JSON.parse(JSON.stringify(widget));
                    delete widgetClone["_id"];
                    widgetClone.formId = newFormId;
                    widgetClone.id = widget.id;
                    await db.insert("FieldDetails").entries(widgetClone);
                }
                // Insert version management record.
                versionManage.formId = newFormId;
                versionManage.version = 1;
                await db.insert(VersionManagement).entries(versionManage);
                versionRes = { status: 200, message: `${updateForm.formType} created successfully` };
            } else {
                // Inline incrementFormVersion logic:
                const formRecords = await db.read(Forms).where({ ID: updateForm.formId, typeOfForm: "AssetsForm" });
                if (formRecords && formRecords.length > 0) {
                    const formRecord = formRecords[0];
                    const newVersion = parseInt(formRecord.version) + 1;
                    await db.update(Forms)
                        .set({ version: newVersion })
                        .where({ ID: updateForm.formId, typeOfForm: "AssetsForm" });
                    // Insert version management record (simulate versionManagementFunc).
                    await db.insert(VersionManagement).entries({
                        ...versionManage,
                        formId: updateForm.formId,
                        version: newVersion,
                        isUpdate: true
                    });
                    versionRes = { status: 200, message: `${updateForm.formType.charAt(0).toUpperCase()}${updateForm.formType.slice(1)} updated successfully` };
                } else {
                    versionRes = { status: 500, message: "Form record not found for version update" };
                }
            }

            // ===== Update Form Collection =====
            // Read all form records from Activityforms and ensure each has a corresponding record in FormCollection.
            const sourceRecords = await db.read(Forms).where({ typeOfForm: "Activityforms" });
            for (const record of sourceRecords) {
                const recordFormId = record.ID; // Adjust based on your CDS key
                const objectType = record.objectType || "";
                const type = record.type || "";
                const collectionName = objectType + record.name.replace(/[^a-zA-Z0-9]/g, "");
                const existingRecord = await db.read(FormCollection).where({ formId: recordFormId });
                if (!existingRecord || existingRecord.length === 0) {
                    await db.insert(FormCollection).entries({
                        formId: recordFormId,
                        objectType: objectType,
                        type: type,
                        collectionName: collectionName
                    });
                    console.log(`Inserted new record with formId: ${recordFormId}`);
                } else {
                    console.log(`Record with formId: ${recordFormId} already exists, skipping.`);
                }
            }
            console.log("Processing complete.");
            return versionRes;
        } catch (error) {
            console.error("Error during form update:", error);
            return { status: 500, message: "Something went wrong" };
        }
    });

    srv.on("PUT", "AssetFieldDetails", async (req) => {
        try {
            // ===== Data Preparation =====
            let formId = req.data.formId; // Assume formId is provided as a UUID string.
            let updateForm = { ...req.data };

            // Parse JSON strings for FormSkeleton and formSkeletonLevelChanges.
            const FormSkeleton = JSON.parse(updateForm.FormSkeleton);
            updateForm.FormSkeleton = FormSkeleton;
            const widgetsToBeAdded = JSON.parse(updateForm.formSkeletonLevelChanges);
            const isWholeSkeleton = updateForm.isWholeSkeleton;
            const isCreateNewForm = updateForm.isCreateNewForm;
            updateForm.formId = formId;
            const updateDataInForm = JSON.parse(updateForm.formUpdate);

            // Prepare version management object.
            let versionManage = {
                ...updateDataInForm,
                formSkeletonLevelChanges: widgetsToBeAdded,
                FormSkeleton: FormSkeleton
            };
            if (updateForm.lastModifiedBy) {
                versionManage.lastModifiedBy = updateForm.lastModifiedBy;
            }
            const newFormName = updateForm.newFormName;

            // Clean up unwanted properties.
            delete updateForm.skeleton;
            delete updateForm.message;
            delete updateForm.status;
            delete updateForm.formSkeletonLevelChanges;
            delete updateForm.FormSkeleton;
            delete updateForm.isWholeSkeleton;
            delete updateForm.isCreateNewForm;
            delete updateForm.lastModifiedDate;
            delete updateForm.basicLevelChanges;
            delete updateForm.formSkeletonLevelChanges;
            delete updateForm.derivedFieldVersion;
            delete updateForm.FormSkeleton;

            // Set additional metadata.
            updateForm.createdTime = new Date();
            updateForm.objectType = updateForm.objectType || "Steel";

            // ===== Check if the form already exists =====
            const existingForms = await db.read(Forms)
                .where({ name: updateForm.name, isVisible: true, formType: "form", typeOfForm: "AssetsForm" });
            if (existingForms && existingForms.length > 0) {
                return { status: 208, message: "Forms already exists" };
            }
            if (updateForm.__v) {
                delete updateForm.__v;
            }

            // ===== Merge Data with Schema =====
            // Inline mergeDataWithSchema function.
            function mergeDataWithSchema(inputData, schema) {
                const mergedData = {};
                for (let key in schema) {
                    if (inputData.hasOwnProperty(key)) {
                        if (typeof schema[key] === "object" && schema[key] !== null && !Array.isArray(schema[key])) {
                            mergedData[key] = mergeDataWithSchema(inputData[key] || {}, schema[key]);
                        } else {
                            mergedData[key] = inputData[key];
                        }
                    } else {
                        mergedData[key] = schema[key];
                    }
                }
                return mergedData;
            }
            // Assume dbData.AssetForm holds the target schema.
            const mergedResult = mergeDataWithSchema(updateForm, dbData.AssetForm);

            // ===== Insert New Form Record =====
            const insertResult = await db.insert(Forms).entries(mergedResult);
            formId = insertResult.insertedId || mergedResult.ID;

            // ===== Insert Widgets into FieldDetails =====
            let position = 1;
            for (const widget of FormSkeleton) {
                // Clone widget.
                const widgetClone = JSON.parse(JSON.stringify(widget));
                delete widgetClone["ID"];
                widgetClone.formId = formId;
                widgetClone.id = widget.id;
                widgetClone.position = position++;
                await db.insert("FieldDetails").entries(widgetClone);
            }

            // ===== Version Management Insertion =====
            updateForm.formId = formId;
            updateForm.version = 1;
            updateForm.formSkeletonLevelChanges = widgetsToBeAdded;
            await db.insert(VersionManagement).entries(updateForm);

            // ===== Log Asset for Form Creation =====
            // Inline assetLogForForm (minimal version).
            async function assetLogForForm(formData, msg) {
                console.log("Asset Log:", msg, formData);
                // Optionally, insert a log record in a logging entity.
            }
            await assetLogForForm(updateForm, updateForm.formType + " Created");

            // ===== Handle Skeleton Updates =====
            if (isWholeSkeleton) {
                // Delete existing fields for this form.
                const deleteRes = await db.delete(FieldDetails).where({ formId });
                // Insert new fields (already inserted above if whole skeleton is used).
                // (Assuming whole skeleton means reinsert everything.)
                let pos = 1;
                for (const widget of FormSkeleton) {
                    const widgetClone = JSON.parse(JSON.stringify(widget));
                    delete widgetClone["_id"];
                    widgetClone.formId = formId;
                    widgetClone.id = widget.id;
                    widgetClone.position = pos++;
                    await db.insert(FieldDetails).entries(widgetClone);
                }
            } else {
                // If not whole skeleton, update only fields that require updating.
                if (widgetsToBeAdded.update && widgetsToBeAdded.update.length > 0) {
                    for (const widget of widgetsToBeAdded.update) {
                        // If widget has an ID, update the record.
                        if (widget._id) {
                            const widgetId = widget._id;
                            delete widget._id;
                            await db.update(FieldDetails)
                                .set(widget)
                                .where({ ID: widgetId, formId });
                        } else {
                            // Insert new widget record.
                            widget.formId = formId;
                            await db.insert(FieldDetails).entries(widget);
                        }
                    }
                }
            }

            // ===== Form Version Management: Create New or Increment =====
            let versionRes;
            if (isCreateNewForm) {
                console.log("Creating new form version...");
                versionManage.createdTime = new Date();
                delete versionManage.lastUpdatedDate;
                versionManage.createdBy = req.data.createdBy;
                updateForm.name = newFormName;
                req.data.name = newFormName;
                versionManage.name = newFormName;
                versionManage.isCopy = true;
                // Inline creation of new form: Insert a new record in AssetsForm.
                const newInsert = await db.insert(Forms).entries(updateForm);
                const newFormId = newInsert.insertedId;
                // Insert fields for new form.
                for (const widget of FormSkeleton) {
                    const widgetClone = JSON.parse(JSON.stringify(widget));
                    delete widgetClone["_id"];
                    widgetClone.formId = newFormId;
                    widgetClone.id = widget.id;
                    await db.insert(FieldDetails).entries(widgetClone);
                }
                // Insert version management record with version 1.
                versionManage.formId = newFormId;
                versionManage.version = 1;
                await db.insert(VersionManagement).entries(versionManage);
                versionRes = { status: 200, message: `${updateForm.formType} created successfully` };
            } else {
                // Increment form version: Read the current form, increment the version, and update.
                const formRecords = await db.read(Forms).where({ ID: formId, typeOfForm: "AssetsForm" });
                if (formRecords && formRecords.length > 0) {
                    const formRecord = formRecords[0];
                    const newVersion = parseInt(formRecord.version) + 1;
                    await db.update(Forms)
                        .set({ version: newVersion })
                        .where({ ID: formId, typeOfForm: "AssetsForm" });
                    // Insert version management record with update flag.
                    await db.insert(VersionManagement).entries({
                        ...versionManage,
                        formId: formId,
                        version: newVersion,
                        isUpdate: true
                    });
                    versionRes = { status: 200, message: `${updateForm.formType.charAt(0).toUpperCase()}${updateForm.formType.slice(1)} updated successfully` };
                } else {
                    versionRes = { status: 500, message: "Form record not found for version update" };
                }
            }

            // ===== Update Form Collection Inline =====
            const sourceRecords = await db.read(Forms).where({ typeOfForm: "Activityforms" });
            for (const record of sourceRecords) {
                const recordFormId = record.ID; // Adjust according to your CDS model key
                const objectType = record.objectType || "";
                const type = record.type || "";
                const collectionName = objectType + record.name.replace(/[^a-zA-Z0-9]/g, "");
                const existingRecord = await db.read(FormCollection).where({ formId: recordFormId });
                if (!existingRecord || existingRecord.length === 0) {
                    await db.insert(FormCollection).entries({
                        formId: recordFormId,
                        objectType: objectType,
                        type: type,
                        collectionName: collectionName
                    });
                    console.log(`Inserted new record with formId: ${recordFormId}`);
                } else {
                    console.log(`Record with formId: ${recordFormId} already exists, skipping.`);
                }
            }
            console.log("Processing complete.");

            return {
                status: 200,
                message: `${req.data.formType.charAt(0).toUpperCase()}${req.data.formType.slice(1)} updated successfully`,
                formId: formId.toString()
            };
        } catch (error) {
            console.error("Error during form update:", error);
            return { status: 500, message: "Something went wrong" };
        }
    });

    srv.on("CREATE", "FieldUser", createFieldUser);

    srv.on("READ", "FieldUser", getAllFieldUsers);

    srv.on("PUT", "FieldUser", updateFieldUser);

    srv.on("DELETE", "FieldUser", deleteFieldUser);

    srv.on("READ", "DocumentUploads", getDocumentUploads);

    srv.on("DELETE", "DocumentUploads", deleteDocumentUploaded);

    srv.on("CREATE", "DeviceData", createDeviceData);

    srv.on("READ", "DeviceData", getDeviceData);

    srv.on("PUT", "DeviceData", editDeviceData);

    srv.on("DELETE", "DeviceData", deleteDeviceData);

    srv.on("READ", "DeviceActivity", getDeviceActivities);

    srv.on("READ", "Downloadtemplates", getAllDownloadTemplates);

    srv.on("CREATE", "Downloadtemplates", createDownloadTemplate);

    srv.on("READ", "Projects", getAllProjects);

    srv.on("CREATE", "Projects", createProject);

    srv.on("READ", "ProjectInsights", getDetailedProjectInsights);

    //Issue
    srv.on("READ", "GetOverallProjectInsights", async (req) => {
        try {
            // Build dynamic query, sort, and pagination using your helper function
            let { query, sort, pagination } = await buildDynamicQuery(req, ["projectName", "departmentName", "startDate", "endDate"]);

            // Apply default isDeleted filter
            query.isDeleted = false;

            // Handle the database query using CAP's db.read()
            let result = await db.read(Projects)  // Assuming you want to read from 'Projects' table or an appropriate entity
                .where(query)
                .orderBy(sort);

            // Apply pagination if required
            if (pagination.top && pagination.skip !== undefined) {
                const skip = parseInt(pagination.skip, 10);
                const top = parseInt(pagination.top.val, 10);
                result = await db.read(Projects)
                    .where(query)
                    .orderBy(sort)
                    .limit(top, skip);
            }

            // Return the result directly from the HANA database
            return result;

        } catch (error) {
            console.error("Error reading getOverallProjectInsights:", error);
            return req.error(400, "An error occurred while fetching project insights.");
        }
    });

    //Issue
    srv.on("POST", "GetProjectCompletion", async (req) => {
        try {
            const data = req.data;
            const projectIds = JSON.parse(data.projectIds);

            let steelData = await getSteelCompletion(data.deptId, projectIds);
            let mdpeData = await getMdpeCompletion(data.deptId, projectIds);

            return { status: 200, data: { Steel: steelData, Mdpe: mdpeData } };

        } catch (error) {
            console.error("Error:", error);
            return req.error(500, 'Internal server error');
        }
    });

    //Issue
    srv.on('POST', 'getGADelayedProjects', async (req) => {
        let data = req.data;
        let result;
        try {
            result = await getGADelayedProjects(data);
            return result;
        } catch (error) {
            console.error("Error reading getProjectCompletion:", error);
            return req.error(400, { message: "Internal Server Error in Delayed Projects", status: 400 });
        }
    });

    //Issue
    srv.on("READ", "DepartProjectDetails", async (req) => {
        try {
            // Build dynamic query using the helper function
            let { query, sort, pagination } = await buildDynamicQuery(req, ["name", "projectName", "departmentName"]);

            // Apply additional default filters
            query.isDeleted = false; // Example: default filtering for "isDeleted" field

            // Handle pagination
            let documents;
            if (pagination.top && pagination.skip !== undefined) {
                const skip = parseInt(pagination.skip, 10);
                const top = parseInt(pagination.top.val, 10);

                // Fetch from the appropriate table based on the query field
                if (query["name"]) {
                    documents = await db.read(Departments)
                        .where(query)
                        .orderBy(sort)
                        .limit(top, skip);
                } else if (query["projectName"]) {
                    documents = await db.read(Projects)
                        .where({ name: query["projectName"], ...query })
                        .orderBy(sort)
                        .limit(top, skip);
                } else if (query["departmentName"]) {
                    documents = await db.read(Projects)
                        .where({ departmentName: query["departmentName"], ...query })
                        .orderBy(sort)
                        .limit(top, skip);
                } else {
                    documents = await db.read(Departments)
                        .where(query)
                        .orderBy(sort)
                        .limit(top, skip);
                }
            } else {
                // Fetch without pagination if no pagination is provided
                if (query["name"]) {
                    documents = await db.read(Departments)
                        .where(query)
                        .orderBy(sort);
                } else if (query["projectName"]) {
                    documents = await db.read(Projects)
                        .where({ name: query["projectName"], ...query })
                        .orderBy(sort);
                } else if (query["departmentName"]) {
                    documents = await db.read(Projects)
                        .where({ departmentName: query["departmentName"], ...query })
                        .orderBy(sort);
                } else {
                    documents = await db.read(Departments)
                        .where(query)
                        .orderBy(sort);
                }
            }

            // Calculate total count (for OData $count support)
            const totalCount = (await db.read(Departments)
                .where(query))
                .length;

            // Add the count property to the response
            documents.$count = totalCount;

            return { data: documents };

        } catch (err) {
            console.error("Error reading documents from HANA", err);
            req.error(500, "Unable to fetch data");
            return [];
        }
    });

    srv.on("READ", "GetAllContractor", getAllContractors);

    //Issue
    srv.on("READ", "ProjectAssetsComponents", async (req) => {
        const startTime = Date.now();
        try {
            // Step 1: Parse and prepare the query object using buildDynamicQuery
            const { query = {}, sort, pagination } = await buildDynamicQuery(req, []);

            query.isDeleted = false;

            // Step 2: Destructure query properties safely with fallback defaults
            const {
                projectName = "", // Default empty string if not found
                type = "",        // Default empty string if not found
                userType = null,  // Default null if not found
                name = null,      // Default null if not found
                UserName = null,  // Default null if not found
            } = query;


            let filter = { projectName, isDeleted: false };

            if (userType && name && UserName) {
                filter.submittedBy = { "=": UserName };  // Use eq for comparison in HANA
            }

            // Step 3: Check if projectName exists before querying for projects
            if (!projectName) {
                req.error(400, "Project name is required");
                return;
            }

            // Step 4: Fetch project details from the "Projects" table
            const projectDetailsStartTime = Date.now();
            const projectDetails = await db.read(Projects).where({ name: projectName }).limit(1);
            console.log(`Projects Query Time: ${Date.now() - projectDetailsStartTime}ms`);

            if (!projectDetails) {
                throw new Error(`No project found with name: ${projectName}`);
            }

            const equiptype = projectDetails.equipmentType.toString();

            // Step 5: Fetch assets data from the "AssetsForm" table
            const assetsDataStartTime = Date.now();
            const assetsData = await db.read(Forms).where({ objectType: equiptype, type, typeOfForm: "AssetsForm" });
            console.log(`Assets Form Query Time: ${Date.now() - assetsDataStartTime}ms`);

            // Step 6: Process each asset data asynchronously
            const assetDetailsPromises = assetsData.map(async (asset) => {
                const collectionName = `${asset.objectType}${asset.name.replace(/[^a-zA-Z0-9]/g, "")}`;
                const assetQuery = { ...filter };

                if (collectionName === "SteelPipe") {
                    assetQuery.Status = "Consumed"; // Apply specific status for SteelPipe
                }

                // Step 7: Aggregation using HANA SQL-style groupBy
                const aggregationStartTime = Date.now();
                const qaQcAggregation = await db.read(collectionName)
                    .where(assetQuery)
                    .groupBy(["QA/QC Status"])  // Group by 'QA/QC Status'
                    .select([
                        { field: "count(*)", as: "totalCount" },
                        { field: "sum(CASE WHEN \"QA/QC Status\" = 'QC Pending' THEN 1 ELSE 0 END)", as: "pendingCount" },
                        { field: "sum(CASE WHEN \"QA/QC Status\" = 'QC Approved' THEN 1 ELSE 0 END)", as: "approvedCount" },
                        { field: "sum(CASE WHEN \"QA/QC Status\" = 'QC Pending' THEN \"Length (m)\" ELSE 0 END)", as: "totalPendingLength" },
                        { field: "sum(CASE WHEN \"QA/QC Status\" = 'QC Approved' THEN \"Length (m)\" ELSE 0 END)", as: "totalApprovedLength" },
                    ]);
                console.log(`Aggregation Query Time for ${asset.name}: ${Date.now() - aggregationStartTime}ms`);

                // Extract data from the aggregation result
                const qaQc = qaQcAggregation[0] || {};
                return {
                    assetName: asset.name,
                    count: qaQc.totalCount || 0,
                    pendingCount: qaQc.pendingCount || 0,
                    approvedCount: qaQc.approvedCount || 0,
                    totalPendingLength: qaQc.totalPendingLength || 0,
                    totalApprovedLength: qaQc.totalApprovedLength || 0,
                    isGeoDataAvailable: asset.isGeoDataAvailable,
                };
            });

            // Step 8: Wait for all asset details to be processed
            const assetDetails = await Promise.all(assetDetailsPromises);

            // Step 9: Calculate totals for all assets
            const totalPendingLength = assetDetails.reduce((sum, item) => sum + item.totalPendingLength, 0);
            const totalApprovedLength = assetDetails.reduce((sum, item) => sum + item.totalApprovedLength, 0);

            console.log(`Total Execution Time: ${Date.now() - startTime}ms`);

            return {
                formDetails: {
                    data: assetsData,
                    count: assetsData.length,
                },
                assetDetails: {
                    data: assetDetails,
                    count: assetDetails.length,
                    totalPendingLength,
                    totalApprovedLength,
                },
                projectDetails: {
                    data: projectDetails,
                },
            };
        } catch (err) {
            console.error("Failed to fetch data:", err.message);
            req.error(500, "Internal Server Error");
        }
    });

    //Issue
    srv.on("READ", "ProjectActivityComponents", async (req) => {
        const startTime = Date.now();
        try {
            // Step 1: Use buildDynamicQuery to prepare the query object
            const { query = {}, sort, pagination } = await buildDynamicQuery(req, []);

            query.isDeleted = false; // Enforce isDeleted filter

            // Step 2: Destructure query properties safely with fallback defaults
            const {
                projectName = "",   // Default empty string if not found
                userType = null,    // Default null if not found
                name = null,        // Default null if not found
                UserName = null,    // Default null if not found
            } = query;

            // Step 3: Validate projectName is present
            if (!projectName) {
                req.error(400, "Project name is required");
                return;
            }

            // Prepare the filter for querying
            let filter = { projectName, isDeleted: false };

            // Apply filter for submittedBy if userType, name, and UserName are present
            if (userType && name && UserName) {
                filter.submittedBy = { "=": UserName };  // HANA equivalent of $in is handled with eq and OR logic
            }

            // Step 4: Fetch project details from "Projects" table
            const projectQueryStartTime = Date.now();
            const [projectDetails] = await db.read(Projects).where({ name: projectName, isDeleted: false });
            console.log(`Projects Query Time: ${Date.now() - projectQueryStartTime}ms`);

            if (!projectDetails) {
                throw new Error(`No project found with name: ${projectName}`);
            }

            // Step 5: Fetch activity forms from "Activityforms" table
            const activityFormsQueryStartTime = Date.now();
            const activityFormsData = await db.read(Forms).where({ typeOfForm: "Activityforms" });
            console.log(`Activityforms Query Time: ${Date.now() - activityFormsQueryStartTime}ms`);

            // Step 6: Fetch asset counts for each activity form concurrently
            const assetDetailsPromises = activityFormsData.map(async (activityForm) => {
                const assetName = activityForm.name;
                const collectionName = `Activity${assetName.replace(/[^a-zA-Z0-9]/g, "")}`;

                // Step 7: Count documents for each asset in the collection
                const countQueryStartTime = Date.now();
                const countResult = await db.read(collectionName)
                    .where(filter)
                    .count();  // Using CAP's count() method instead of MongoDB's countDocuments
                console.log(`Asset Count Query for ${collectionName}: ${Date.now() - countQueryStartTime}ms`);

                return {
                    assetName,
                    count: countResult,
                };
            });

            // Wait for all asset details to be processed
            const resultData = await Promise.all(assetDetailsPromises);

            // Step 8: Calculate total execution time
            const totalExecutionTime = Date.now() - startTime;
            console.log(`Total Execution Time: ${totalExecutionTime}ms`);

            return {
                formDetails: {
                    data: activityFormsData,
                    count: activityFormsData.length,
                },
                assetDetails: {
                    data: resultData,
                    count: resultData.length,
                },
                projectDetails: {
                    data: projectDetails,
                },
            };
        } catch (err) {
            console.error("Failed to fetch data:", err.message);
            req.error(500, "Internal Server Error");
        }
    });

    srv.on("PUT", "Projects", async (req) => {
        try {
            const name = req.params[0].name;

            const projectData = {
                ...req.data,
                estimatedStartDate: req.data.startDate,
                estimatedEndDate: req.data.endDate,
            };
            delete projectData.startDate;
            delete projectData.endDate;

            const result = await db.update("Projects")
                .set(projectData)
                .where({ name });

            if (result.matchedCount === 1) {
                console.log("Project Updated Successfully");
                return { message: "Project Updated Successfully" };
            } else {
                console.log("Project Not Found");
                return req.error(404, "Project Not found");
            }
        } catch (err) {
            console.error("Error updating project:", err);
            req.error(500, "Unable to update project");
            return [];
        }
    });
});
