const { connectDB } = require("../lib/db-connect");
const { Departments,
    Vendors } = cds.entities('Common');
const {
    buildDynamicQuery,
    uploadImageToAzure, deleteImageFromAzure
} = require('../lib/helpers');

let db;

(async () => {
    db = await connectDB();
})();

async function getVendors(req) {
    try {
        const defaultFields = ["name", "type", "shortname"];
        const { query, sort, pagination } = await buildDynamicQuery(req, defaultFields);
        const sortOrder = sort.length ? sort : [{ ref: ["name"], sort: "asc" }];
        const documents = await db.read(Vendors)
            .where(query)
            .orderBy(sortOrder)
            .limit(pagination.top.val, pagination.skip);

        let totalCount = (await db.read(Vendors).where(query)).length;
        documents["$count"] = totalCount;
        return documents;
    } catch (error) {
        console.error("Error fetching vendors:", error);
        return req.reject(500, "Error fetching vendors");
    }
}

async function createVendor(req) {
    let { res } = req.http;
    try {
        const { name, img, imagefilename, departmentName, createdByEmailID, shortname, type } = req.data;

        if (!name || !departmentName || !createdByEmailID || !shortname || !type) {
            return req.reject(400, "Missing required fields. Please ensure name, departmentName, shortname, type, and createdByEmailID are provided.");
        }
        // if (!img || !imagefilename) {
        //     return req.reject(400, "Vendor image and filename are required.");
        // }

        const existingVendor = await db.read(Vendors).where({ name, department_name: departmentName });

        if (existingVendor.length > 0) {
            return req.reject(409, `Vendor with name "${name}" already exists in ${departmentName}`);
        }

        const department = await db.read(Departments).columns("ID", "name").where({ name: departmentName });

        if (department.length === 0) {
            return req.reject(404, `Department "${departmentName}" not found`);
        }
        const departmentId = department[0].ID;

        const fileUrl = await uploadImageToAzure(name, img, imagefilename, connectionString, containerName);

        const vendorData = {
            name,
            shortName: shortname,
            type,
            createdByEmailID,
            department_name: departmentName,
            department_ID: departmentId,
            imageFileName: imagefilename,
            img: fileUrl,
            isDeleted: false,
        };

        await db.create(Vendors).entries(vendorData);
        return vendorData;
    } catch (err) {
        console.error("Error inserting vendor into HANA DB", err);
        return req.reject(500, `Unable to insert vendor data: ${err.message}`);
    }
}

async function editVendor(req) {
    try {
        const name = req.params[0].name;
        const { img, imagefilename, shortname, type, departmentName } = req.data;
        const vendor = await db.read(Vendors).where({ name, department_name: departmentName });
        if (vendor.length === 0) {
            return req.reject(404, `Vendor with name "${name}" not found in ${departmentName}`);
        }
        const existingVendor = vendor[0];
        let fileUrl = existingVendor.img;
        if (img && imagefilename) {
            if (existingVendor.imagefilename && existingVendor.imagefilename !== imagefilename) {
                await deleteImageFromAzure(`${name}_${existingVendor.imagefilename}`, connectionString, containerName);
            }
            fileUrl = await uploadImageToAzure(name, img, imagefilename, connectionString, containerName);
        }

        const updatedVendorData = { shortname, type, imagefilename, img: fileUrl };
        const result = await db.update(Vendors).set(updatedVendorData).where({ name, department_name: departmentName });

        if (result === 1) {
            return { message: `Vendor with name ${name} updated successfully` };
        } else {
            return req.reject(404, `Vendor with name ${name} not found`);
        }
    } catch (err) {
        console.error("Error updating vendor in HANA DB", err);
        return req.reject(500, "Unable to update vendor data");
    }
}

module.exports = {
    getVendors, createVendor, editVendor
}