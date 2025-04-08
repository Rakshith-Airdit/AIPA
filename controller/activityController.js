const { connectDB } = require("../lib/db-connect");
const { Forms } = cds.entities('Common');
const {
    buildDynamicQuery
} = require('../lib/helpers');

let db;

(async () => {
    db = await connectDB();
})();

async function getAllActivities(req) {
    try {
        const { query, sort, pagination } = await buildDynamicQuery(req, ["createdTime", "name"]);

        // Remove the "isDeleted" filter if it exists since the Forms table does not have it.
        if (query.hasOwnProperty("isDeleted")) {
            delete query.isDeleted;
        }

        query.typeOfForm = "ActivityForm";

        // Execute the query using CAP/HANA APIs.
        const documents = await db.read(Forms)
            .where(query)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        // Format the results if necessary (e.g. aliasing the key)
        const formattedDocuments = documents.map(doc => ({
            id: doc.ID || doc._id, // Adjust based on your CDS model key field
            ...doc
        }));

        // Retrieve total count for OData compatibility.
        const totalCount = (await db.read(Forms).where(query)).length;
        formattedDocuments["$count"] = totalCount;

        return formattedDocuments;
    } catch (err) {
        console.error("Error reading documents from HANA DB", err);
        req.error(500, "Unable to fetch data");
        return [];
    }
}

async function createActivity(req) {
    try {
        const {
            name,
            applicationType,
            objectType,
            dependentFields,
            allocatedDepartments,
            displayField,
            formzCategory,
            category,
            isVisible,
            formType,
            type,
            departmentName,
            ownerMailId,
            ownerName,
            description,
            workInstructions,

        } = req.data;

        const activityData = {
            name,
            applicationType,
            objectType,
            dependentFields,
            allocatedDepartments,
            displayField,
            formzCategory,
            category,
            isVisible,
            formType,
            type,
            departmentName,
            ownerMailId,
            ownerName,
            description,
            workInstructions,
            createdTime: new Date(),
            typeOfForm: "ActivityForm"
        };

        // Insert the new activity record using CAP/HANA API.
        const result = await db.insert(Forms).entries(activityData);
        console.log(`Inserted in HANA DB with result:`, result);

        return activityData;
    } catch (err) {
        console.error("Error inserting document into HANA DB", err);
        req.error(500, "Unable to insert data");
        return [];
    }
}

async function editActivity(req) {
    try {
        const name = req.params[0].name;
        const {
            applicationType,
            objectType,
            dependentFields,
            allocatedDepartments,
            displayField,
            formzCategory,
            category,
            isVisible,
            formType,
            type,
            departmentName,
            ownerMailId,
            ownerName,
            description,
            workInstructions,
        } = req.data;

        // Build the update payload.
        const activityData = {
            applicationType,
            objectType,
            dependentFields,
            allocatedDepartments,
            displayField,
            formzCategory,
            category,
            isVisible,
            formType,
            type,
            departmentName,
            ownerMailId,
            ownerName,
            description,
            workInstructions,
        };

        // Update the record using CAP/HANA API.
        const result = await db.update(Forms)
            .set(activityData)
            .where({ name, typeOfForm: "ActivityForm" });

        // Check if a record was matched/updated.
        if (result && result.matchedCount === 1) {
            console.log("Activity Updated Successfully");
            return { message: "Activity Updated Successfully" };
        } else {
            console.log("Activity Not Found");
            return req.error(404, "Activity Not Found");
        }
    } catch (err) {
        console.error("Error updating activity in HANA DB", err);
        req.error(500, "Unable to update data");
        return [];
    }
}

async function deleteActivity(req) {
    try {
        const name = req.params[0].name;

        // First, check if the record exists
        const existingRecords = await db.read(Forms).where({ name, typeOfForm: "ActivityForm" });
        if (!existingRecords || existingRecords.length === 0) {
            return req.error(404, `Activity ${name} Not Found`);
        }

        // Delete the record using CAP/HANA API
        const deleteResult = await db.delete(Forms).where({ name, typeOfForm: "ActivityForm" });
        // In CAP, delete() typically returns the number of affected rows.
        if (deleteResult > 0) {
            console.log(`Activity ${name} Deleted Successfully`);
            return { message: `Activity ${name} Deleted Successfully` };
        } else {
            return req.error(404, `Activity ${name} Not Found`);
        }
    } catch (err) {
        console.error("Error deleting document from HANA DB", err);
        req.error(500, "Unable to delete data");
    }
}

module.exports = {
    getAllActivities, createActivity, editActivity, deleteActivity
}