const { connectDB } = require("../lib/db-connect");
const { Users, Departments, AssetNetworks, DeviceManagement, Projects } = cds.entities('Common');
const {
    buildDynamicQuery, DateFilter
} = require('../lib/helpers'); const axios = require("axios");

let db;

(async () => {
    db = await connectDB();
})();

async function createDepartment(req) {
    try {
        const { name, postalCode, applicationType, description } = req.data;
        // Check if a department with the same name or postalcode already exists using HANA REST–styled queries
        const duplicateNameCheck = await db.read(Departments).where({ name });
        const duplicatePostalCheck = await db.read(Departments).where({ postalCode });

        // If a duplicate is found for either name or postalcode, return the appropriate error message
        if (duplicateNameCheck.length > 0 && duplicatePostalCheck.length > 0) {
            return req.error(400, "Department with the same name and postalcode already exists.");
        } else if (duplicateNameCheck.length > 0) {
            return req.error(400, "Department with the same name already exists.");
        } else if (duplicatePostalCheck.length > 0) {
            return req.error(400, "Department with the same postalcode already exists.");
        }

        const now = new Date();

        const accountsData = {
            ID: cds.utils.uuid(),
            name, postalCode, applicationType, description,
            createdDateTime: now,
            isDeleted: false,
        };

        // Insert the new department record using HANA REST–styled insert query
        // const result = await db.create(Departments).entries(accountsData);
        const result = await db.insert(accountsData).into(Departments);
        console.log(`Document inserted in HANA DB with result:`, result);

        return result;
    } catch (err) {
        console.error("Error inserting document into HANA DB", err);
        req.error(500, "Unable to insert data");
    }
}

async function getDepartments(req) {
    try {
        // Use buildDynamicQuery with default fields for departments
        const defaultFields = ["name"];
        let { query, sort, pagination } = await buildDynamicQuery(req, defaultFields);

        // --- Additional Custom Mappings ---
        // Map "departmentName" to "departments.name" if present in the query
        if (query["departmentName"]) {
            query["departments.name"] = query["departmentName"];
            delete query["departmentName"];
        }

        // Apply date filtering if "creationDate" is present using the DateFilter helper
        if (query["creationDate"]) {
            const dateFilters = await DateFilter(query, "creationDate", "createdDateTime");
            query = { ...query, ...dateFilters };
        }

        // If no sorting is provided, default to sorting by creationDate descending
        if (!sort || sort.length === 0) {
            sort = [{ ref: ["createdDateTime"], sort: "desc" }];
        }

        // --- Execute HANA REST–styled Query ---
        // Fetch documents based on dynamic query, sorting, and pagination
        const documents = await db.read(Departments)
            .where(query)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        // Retrieve the total count of matching records
        const totalCount = (await db.read(Departments).where(query)).length;

        // Map the result and add a "$count" property
        const result = documents.map((doc) => ({ ...doc }));
        result["$count"] = totalCount;
        return result;
    } catch (err) {
        console.error("Error reading documents from HANA DB", err);
        req.error(500, "Unable to fetch data");
        return [];
    }
}

async function editDepartment(req) {
    try {
        const name = req.params[0].name;
        const { postalCode, applicationType, description } = req.data;

        // Update the department record using HANA REST–styled query
        const result = await db.update(Departments)
            .set({ postalCode, applicationType, description })
            .where({ name });

        if (!result || result.matchedCount === 0) {
            req.error(404, "Document not found");
            return;
        }

        console.log("Document updated successfully");
        return result;
    } catch (err) {
        console.error("Error updating document in HANA DB", err);
        req.error(500, "Error updating document");
    }
}

async function deleteDepartment(req) {
    try {
        const name = req.params[0].name;

        // Update related Users: mark as deleted where the first department's name matches
        await db.update(Users)
            .set({ isDeleted: true })
            .where({ "departments_name": name });

        // Delete related asset networks where projectName matches the department name
        await db.delete(AssetNetworks)
            .where({ property_projectName: name });

        // Update device management records: mark as deleted where departmentName matches
        await db.update(DeviceManagement)
            .set({ isDeleted: true })
            .where({ departmentName: name });

        // Retrieve the project associated with this department
        const projects = await db.read(Projects)
            .where({ departmentName: name });

        const projectTable = projects && projects.length > 0 ? projects[0] : null;

        if (projectTable) {
            const equipmentType = projectTable.equipmentType.toString();
            const projectName = projectTable.name;

            // Mark the project itself as deleted
            await db.update(Projects)
                .set({ isDeleted: true })
                .where({ name: projectName });

            console.log(`Project '${projectName}' marked as deleted.`);

            // Based on equipment type, choose the corresponding collections
            const collections = equipmentType === "Steel" ? steelCollections : mdpeCollections;

            // Loop through each asset collection and mark documents as deleted
            for (const [assetType, collectionName] of Object.entries(collections)) {
                try {
                    await db.update(collectionName)
                        .set({ isDeleted: true })
                        .where({ projectName: projectName, isDeleted: false });
                    console.log(
                        `Marked documents in collection ${collectionName} as deleted for project: ${projectName}`
                    );
                } catch (innerError) {
                    console.error(`Error updating collection ${collectionName}:`, innerError);
                }
            }
        } else {
            console.log(`No project found under department '${name}'`);
        }

        // Finally, delete the department itself
        const result = await db.delete(Departments)
            .where({ name: name });

        if (result && result.deletedCount === 1) {
            console.log(`Department '${name}' and related data deleted successfully.`);
        } else {
            console.log(`No department found with name '${name}'`);
        }

        return;
    } catch (error) {
        console.error("Error deleting department and related data from HANA DB:", error);
        req.error(500, "Error deleting department and related data");
    }
}
module.exports = {
    createDepartment, getDepartments, editDepartment, deleteDepartment
}