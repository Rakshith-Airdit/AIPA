const { connectDB } = require("../lib/db-connect");
const { Users, Departments, ActivityLogs } = cds.entities('Common');
// const { ActivityBackfilling } = cds.entities('Activity');
const { IDP_USERNAME, IDP_PASSWORD, IDP_ENDPOINT, AZURE_CONNECTION_STRING: connectionString, AZURE_CONTAINER_NAME: containerName } = process.env;
const {
    buildDynamicQuery,
    uploadImageToAzure, deleteImageFromAzure, DateFilter
} = require('../lib/helpers');

const axios = require("axios");

let db;

(async () => {
    db = await connectDB();
})();

async function createFieldUser(req) {
    try {
        const {
            username,
            name,
            lastname,
            phone,
            departments_ID,
            departments_name,
            imageurl,
            imagefilename,
            adminType,
        } = req.data;

        // Upload the image to Azure and obtain its URL
        const fileUrl = await uploadImageToAzure(username, imageurl, imagefilename, connectionString, containerName);

        // Format the creation date and time as an ISO string
        const now = new Date();
        const formattedDate = now.toISOString();

        // Build the FieldUser object to be inserted in HANA DB
        let fieldUser = {
            username,
            name,
            lastname,
            phone,
            UserName: username,
            createdDateTime: formattedDate,
            type: 2,
            adminType: adminType,
            imagefilename,
            imageurl: fileUrl,
            isDeleted: false,
            departments_ID,
            departments_name
        };

        console.log("Field user INSERTED IN HANA DB");

        const result = await db.insert(Users).entries(fieldUser);

        // Build the SCIM payload for creating the user in IDP
        const userData = {
            schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
            userName: name,
            name: {
                givenName: name,
                familyName: lastname,
            },
            emails: [{ value: username, type: "work", primary: true }],
            active: true,
            phoneNumbers: [{ value: phone, type: "mobile" }],
            "urn:sap:cloud:scim:schemas:extension:custom:2.0:User": {
                attributes: [
                    { name: "customAttribute1", value: "Field User" },
                    { name: "customAttribute2", value: departments },
                ],
            },
        };

        // Prepare headers and credentials for the IDP API
        const base64Credentials = Buffer.from(
            `${IDP_USERNAME}:${IDP_PASSWORD}`,
            "utf-8"
        ).toString("base64");
        const headers = {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/scim+json",
        };

        // Create the user in the IDP via SCIM API
        const response = await axios.post(
            `${IDP_ENDPOINT}/service/scim/Users`,
            userData,
            { headers }
        );

        console.log("User created successfully in IDP:", response.data);

        // Retrieve the related department record from HANA DB if available
        let department;
        if (departments_name) {
            const depResult = await db.read(Departments).where({ name: departments_name });
            department = depResult && depResult.length > 0 ? depResult[0] : null;
        }

        // Insert an activity log record into HANA DB
        await db.insert(ActivityLogs).entries({
            formDescription: null,
            version: null,
            taskName: null,
            taskId: null,
            deviceModel: null,
            source: null,
            formId: null,
            username: username,
            deviceUUID: null,
            adminname: null,
            formName: null,
            UserName: username,
            recordId: null,
            departmentId: department ? department.ID.toString() : null,
            activity: "User Created",
            timestamp: new Date(),
            departmentName: departments_name,
            isDeleted: false,
        });

        return { ...fieldUser, BTPUSER: response.data };
    } catch (err) {
        console.error("Error during the CREATE operation", err.message);
        req.error(500, "Failed to create user");
    }
}

async function getAllFieldUsers(req) {
    try {
        // Define default fields for filtering/searching
        const defaultFields = ["name", "lastname", "UserName", "departments"];
        let { query, sort, pagination } = await buildDynamicQuery(req, defaultFields);

        // Enforce Field User conditions: type = 2 and isDeleted = false
        query.type = 2;
        query.isDeleted = false;

        // Custom mapping for department filtering:
        // Map "departmentName" or "departments" to the nested field "departments.name"
        if (query["departmentName"]) {
            query["departments.name"] = query["departmentName"];
            delete query["departmentName"];
        } else if (query["departments"]) {
            query["departments.name"] = query["departments"];
            delete query["departments"];
        }

        // If date filtering is applied, merge date filters into the query
        if (query["creationDate"]) {
            const dateFilters = await DateFilter(query, "creationDate", "createdDateTime");
            query = { ...query, ...dateFilters };
        }

        // If no sort order is provided, default to sorting by createdDateTime descending
        if (!sort || sort.length === 0) {
            sort = [{ ref: ["createdDateTime"], sort: "desc" }];
        }

        const users = await db.read(Users)
            .where(query)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        // Retrieve the total count of matching records
        const totalCount = (await db.read(Users).where(query)).length;
        users["$count"] = totalCount;

        return users;
    } catch (err) {
        console.error("Error fetching Field Users:", err);
        req.reject(500, "Failed to fetch data");
    }
}

async function updateFieldUser(req) {
    try {
        const userName = req.params[0].username;
        const { phone, name, adminType, departments_ID, departments_name, imageurl, imagefilename } = req.data;

        // Fetch the existing user from HANA DB
        const users = await db.read(Users).where({ UserName: userName });
        const user = users && users.length > 0 ? users[0] : null;
        if (!user) {
            return req.error(404, `User with username ${userName} not found`);
        }

        let fileUrl = user.imageurl;
        if (imageurl && imagefilename) {
            // Delete the old image from Azure if it exists and the filename is changing
            if (user.imagefilename && user.imagefilename !== imagefilename) {
                await deleteImageFromAzure(`${userName}_${user.imagefilename}`);
            }
            // Upload the new image and update the file URL
            fileUrl = await uploadImageToAzure(userName, imageurl, imagefilename, connectionString, containerName);
        }

        // Build the update record
        const Record = {
            phone,
            adminType,
            departments_ID,
            departments_name,
            imageurl: fileUrl,
            imagefilename: imagefilename,
        };

        // Update the user record in HANA DB using a REST–styled query
        const dbResult = await db.update(Users)
            .set(Record)
            .where({ UserName: userName });

        // Check if any record was matched and updated
        if (!dbResult || dbResult.matchedCount === 0) {
            req.error(404, "Document not found");
            return;
        }
        console.log("Document updated successfully in DB");

        // Build the SCIM payload for updating the user in IDP
        const userData = {
            schemas: [
                "urn:ietf:params:scim:schemas:core:2.0:User",
                "urn:sap:cloud:scim:schemas:extension:custom:2.0:User",
            ],
            userName: name,
            emails: [{ value: userName, type: "work", primary: true }],
            phoneNumbers: [{ value: phone, type: "mobile" }],
            "urn:sap:cloud:scim:schemas:extension:custom:2.0:User": {
                attributes: [
                    { name: "customAttribute1", value: adminType },
                    { name: "customAttribute2", value: departments },
                ],
            },
        };

        // Prepare authentication headers for the IDP API
        const base64Credentials = Buffer.from(`${IDP_USERNAME}:${IDP_PASSWORD}`, "utf-8").toString("base64");
        const headers = {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/scim+json",
        };

        // Check if the user exists in the IDP
        const idpResponse = await axios.get(
            `${IDP_ENDPOINT}/scim/Users?filter=emails.value eq "${userName}"`,
            { headers }
        );

        if (idpResponse.data.Resources && idpResponse.data.Resources.length > 0) {
            const userId = idpResponse.data.Resources[0].id;
            // Update the user in the IDP
            const updateResponse = await axios.put(
                `${IDP_ENDPOINT}/scim/Users/${userId}`,
                userData,
                { headers }
            );
            console.log("User updated successfully in IDP:", updateResponse.data);
        } else {
            console.error("User not found in IDP");
            req.error(404, "User not found in IDP");
            return;
        }

        // Retrieve the department record from HANA DB (if provided)
        let department;
        if (departments_name) {
            const deps = await db.read(Departments).where({ name: departments_name });
            department = deps && deps.length > 0 ? deps[0] : null;
        }

        // Log the update activity using HANA REST–styled insert for activity logs
        await db.insert(ActivityLogs).entries({
            formDescription: null,
            version: null,
            taskName: null,
            taskId: null,
            deviceModel: null,
            source: null,
            formId: null,
            username: null,
            deviceUUID: null,
            adminname: null,
            formName: null,
            UserName: userName,
            recordId: null,
            departmentId: department ? department.ID.toString() : null,
            activity: "User Updated",
            timestamp: new Date(),
            departmentName: departments_name,
            isDeleted: false,
        });

        console.log("Document updated successfully in DB and IDP");
        return dbResult;
    } catch (err) {
        console.error("Error updating user:", err.message);
        req.reject(500, "Failed to update user");
    }
}

async function deleteFieldUser(req) {
    try {
        const UserName = req.params[0].username;
        console.log(`Deleting field user with username: ${UserName}`);

        // Fetch the user from HANA DB using REST–styled query
        const users = await db.read(Users).where({ UserName });
        const user = users && users.length > 0 ? users[0] : null;
        console.log(`User found: ${JSON.stringify(user)}`);
        if (!user) {
            return req.error(404, "User not found");
        }

        // Mark the user as deleted in HANA DB
        const result = await db.update(Users)
            .set({ isDeleted: true })
            .where({ UserName });

        // Prepare credentials and headers for the IDP API call
        const base64Credentials = Buffer.from(`${IDP_USERNAME}:${IDP_PASSWORD}`, "utf-8").toString("base64");
        const headers = {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/scim+json",
        };

        // Check if the user exists in the IDP
        const idpResponse = await axios.get(
            `${IDP_ENDPOINT}/scim/Users?filter=emails.value eq "${UserName}"`,
            { headers }
        );

        if (idpResponse.data.Resources && idpResponse.data.Resources.length > 0) {
            const userId = idpResponse.data.Resources[0].id;
            // Delete the user from the IDP
            const deleteResponse = await axios.delete(
                `${IDP_ENDPOINT}/scim/Users/${userId}`,
                { headers }
            );
            console.log("User deleted successfully in IDP:", deleteResponse.data);
        } else {
            console.error("User not found in IDP");
            req.error(404, "User not found in IDP");
            return;
        }

        return result;
    } catch (err) {
        console.error("Error deleting field user from HANA DB", err);
        req.error(500, "Failed to delete field user");
    }
}

module.exports = {
    createFieldUser,
    getAllFieldUsers,
    updateFieldUser,
    deleteFieldUser
}