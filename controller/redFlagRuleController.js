const { connectDB } = require("../lib/db-connect");
const { Forms, FieldDetails, RedFlagRules } = cds.entities('Common');
const {
    buildDynamicQuery,
} = require('../lib/helpers');

let db;

(async () => {
    db = await connectDB();
})();

async function createRedFlagRule(req) {
    try {
        const {
            form,
            operation,
            projectType,
            value,
            multiValue,
            widgetId,
            compareType,
        } = req.data;

        const formId = form && form.length === 36 ? form : uuidv4();

        // Prepare flagData using the provided data.
        const flagData = {
            form: form,
            formId: formId, // Use form as the identifier string
            operation,
            projectType,
            widgetId,
            compareType,
            value: value || multiValue,
            isActive: true,
            isDeleted: false,
            id: uuidv4(), // Generate unique id using uuidv4
            createdDateTime: new Date(),
            lastModifiedDate: new Date()
        };

        // Insert flagData into the redFlagRules entity.
        const insertResult = await db.insert(RedFlagRules).entries(flagData);
        console.log(`Inserted in HANA DB with result:`, insertResult);

        // Update the form record to mark that a rule is defined.
        // First, try updating AssetsForm.
        let updateResult = await db.update(Forms)
            .set({ isRuleDefined: true })
            .where({ ID: form, typeOfForm: "AssetsForm" });

        // If no record was updated, try updating Activityforms.
        if (!updateResult || updateResult.matchedCount === 0) {
            updateResult = await db.update(Forms)
                .set({ isRuleDefined: true })
                .where({ ID: form, typeOfForm: "Activityforms" });
        }

        return flagData;
    } catch (err) {
        console.error("Error creating red flag rule:", err);
        req.error(500, "Unable to create red flag rule");
        return [];
    }
}

async function getAllRedFlagRules(req) {
    try {
        // Use buildDynamicQuery to build the query, sort, and pagination.
        // Include default fields that are needed for filtering/searching.
        const { query, sort, pagination } = await buildDynamicQuery(req, ["createdDateTime", "widgetId"]);

        // (Optional) Ensure isDeleted is false if not already set.
        if (!query.hasOwnProperty("isDeleted")) {
            query.isDeleted = false;
        }

        // Execute the query against the redFlagRules entity.
        let documents = await db.read(RedFlagRules)
            .where(query)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        // Enrich each document with widgetName from FieldDetails.
        const formattedDocuments = await Promise.all(
            documents.map(async (doc) => {
                const widgetResults = await db.read(FieldDetails).where({ ID: doc.widgetId });
                const widgetName = (widgetResults && widgetResults.length > 0) ? widgetResults[0].label : doc.widgetId;
                return { ...doc, widgetName };
            })
        );

        formattedDocuments["$count"] = formattedDocuments.length;
        return formattedDocuments;
    } catch (err) {
        console.error("Error reading red flag rules:", err.message);
        req.error(500, "Unable to fetch data");
        return [];
    }
}

async function editRedFlagRule(req) {
    try {
        // Extract the identifier from the request parameters and fields from the payload.
        const id = req.params[0].id;
        const { operation, projectType, value, multiValue, widgetId, compareType, form } = req.data;

        // Build the update payload.
        const flagData = {
            operation,
            projectType,
            value: value || multiValue,
            widgetId,
            compareType,
            lastModifiedDate: new Date()
        };

        // Update the redFlagRules record using CAP/HANA API.
        const result = await db.update(RedFlagRules)
            .set(flagData)
            .where({ id });

        // Update isRuleDefined on the related form record.
        try {
            // Here, assume that "form" is a UUID string representing the form's ID.
            const formId = form;
            // Query redFlagRules to check if there are any active rules for the form.
            const redflagRules = await db.read(RedFlagRules).where({ formId, isDeleted: false });
            const isRuleDefined = redflagRules && redflagRules.length > 0;

            // Try to update the AssetsForm first.
            let updateResult = await db.update(Forms)
                .set({ isRuleDefined })
                .where({ ID: formId, typeOfForm: "AssetsForm" });

            // If no matching record was updated, try updating Activityforms.
            if (!updateResult || updateResult.matchedCount === 0) {
                updateResult = await db.update(Forms)
                    .set({ isRuleDefined })
                    .where({ ID: formId, typeOfForm: "Activityforms" });
            }
        } catch (innerErr) {
            console.error("Error in updating isRuleDefined:", innerErr.message);
        }

        // Check if the update on redFlagRules was successful.
        if (result && result.matchedCount === 1) {
            console.log("Flag rule Updated Successfully");
            return { message: "Flag rule Updated Successfully" };
        } else {
            console.log("No Flag Rule Found");
            return req.error(404, "Flag Rule Not found");
        }
    } catch (err) {
        console.error("Error updating flag rule in HANA DB", err);
        req.error(500, "Unable to update data");
        return [];
    }
}

async function deleteRedFlagRule(req) {
    try {
        const id = req.params[0].id; // Extract the rule ID from request parameters

        // Mark the red flag rule as deleted.
        const deleteResult = await db.update(RedFlagRules)
            .set({ isDeleted: true })
            .where({ id });

        // Read the rule that is not deleted.
        const flagRecords = await db.read(RedFlagRules).where({ id, isDeleted: false });
        const flag = flagRecords && flagRecords.length > 0 ? flagRecords[0] : null;

        if (flag) {
            // Retrieve all related red flag rules for the same form.
            const relatedFlags = await db.read(RedFlagRules).where({ formId: flag.formId, isDeleted: false });
            // Determine isRuleDefined based on the number of active (not deleted) flags.
            const isRuleDefined = relatedFlags.length > 1;

            // Update the related form record.
            let updateResult = await db.update(Forms)
                .set({ isRuleDefined })
                .where({ ID: flag.formId, typeOfForm: "AssetsForm" });

            // If no matching AssetsForm record was updated, try updating Activityforms.
            if (!updateResult || updateResult.matchedCount === 0) {
                updateResult = await db.update(Forms)
                    .set({ isRuleDefined })
                    .where({ ID: flag.formId, typeOfForm: "ActivityForms" });
            }
        } else {
            console.warn(`No redFlagRule found with ID: ${id}`);
        }

        if (deleteResult && deleteResult.modifiedCount > 0) {
            console.log("Flag Rule Deleted Successfully");
            return { message: "Flag Rule Deleted Successfully" };
        } else {
            console.warn("No matching Flag Rule found to delete.");
            return { message: "No matching Flag Rule found to delete." };
        }
    } catch (err) {
        console.error("Error in handling DELETE redFlagRule:", err.message);
        req.error(500, "Internal Server Error");
        return { error: "Unable to delete the flag rule." };
    }
}

module.exports = {
    createRedFlagRule,
    getAllRedFlagRules,
    editRedFlagRule,
    deleteRedFlagRule
}