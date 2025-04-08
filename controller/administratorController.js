const { connectDB } = require("../lib/db-connect");
const { Users } = cds.entities('Common');
const {
    buildDynamicQuery,
    uploadImageToAzure, deleteImageFromAzure } = require('../lib/helpers');
const axios = require("axios");
const { IDP_USERNAME, IDP_PASSWORD, IDP_ENDPOINT, AZURE_CONNECTION_STRING: connectionString, AZURE_CONTAINER_NAME: containerName } = process.env;

let db;

(async () => {
    db = await connectDB();
})();

async function getAdministrators(userId) {
    try {
        const defaultFields = ["name", "lastname"];

        let { query, sort, pagination } = await buildDynamicQuery(req, defaultFields);


        // Map departmentName filter to departments.name if needed
        if (query.departmentName) {
            query["departments.name"] = query.departmentName;
            delete query.departmentName;
        }

        const sortOrder = sort.length ? sort : [{ ref: ["createdDateTime"], sort: "desc" }];

        let users = await db.read(Users)
            .where(query)
            .orderBy(sortOrder)
            .limit(pagination.top.val, pagination.skip);

        let totalCount = (await db.read(Users).where(query)).length;
        users["$count"] = totalCount;
        return { users };
    } catch (err) {
        console.error("Error fetching administrators data:", err);
        return req.reject(500, "Failed to fetch data from HANA");
    }
}

async function createAdministrator(userId) {
    try {
        const { username, name, lastname, phone, adminType, departments, imageurl, imagefilename } = req.data;
        const now = new Date();
        const formattedDate = now.toISOString();

        const fileUrl = await uploadImageToAzure(username, imageurl, imagefilename, connectionString, containerName);
        const typeMapping = {
            "Power User": 1,
            "Quality User": 7,
            "Corporate Quality User": 7,
            "Business User": 10,
        };
        const type = typeMapping[adminType] ?? 1;

        const administratorData = {
            UserName: username,
            name,
            lastname,
            UserName: username,
            createdDateTime: formattedDate,
            phone,
            adminType,
            departments: JSON.stringify([{ name: departments }]),
            status: "active",
            imageurl: fileUrl,
            imagefilename,
            type,
            isDeleted: false,
        };

        await db.insert(Users).entries(administratorData);
        return administratorData;
    } catch (err) {
        console.error("Error inserting administrator into HANA DB", err);
        return req.reject(500, "Unable to insert data");
    }
}

async function editAdministrator(req) {
    try {
        const UserName = req.params[0].username;
        const { name, lastname, phone, adminType, departments, imageurl, imagefilename } = req.data;

        const result = await db.read(Users).where({ UserName });
        if (result.length === 0) {
            return req.reject(404, `Administrator with username ${UserName} not found`);
        }
        const existingUser = result[0];

        let fileUrl = existingUser.imageurl;
        if (imageurl && imagefilename) {
            if (existingUser.imagefilename && existingUser.imagefilename !== imagefilename) {
                await deleteImageFromAzure(`${UserName}_${existingUser.imagefilename}`, connectionString, containerName);
            }
            fileUrl = await uploadImageToAzure(UserName, imageurl, imagefilename, connectionString, containerName);
        }

        const updateData = {
            name,
            lastname,
            phone,
            adminType,
            departments: JSON.stringify([{ name: departments }]),
            imageurl: fileUrl,
            imagefilename,
        };

        const updated = await db.update(Users)
            .set(updateData)
            .where({ UserName });
        if (updated === 1) {
            return { message: `Administrator with username ${UserName} updated successfully` };
        } else {
            return req.reject(404, `Administrator with username ${UserName} not found`);
        }
    } catch (err) {
        console.error("Error updating administrator in HANA DB", err);
        return req.reject(500, "Failed to update administrator");
    }
}

async function deleteAdministrator(req) {
    try {
        const username = req.params[0].username;
        console.log(`Attempting to delete administrator with username: ${username}`);

        const userInHana = await db.read(Users).where({ UserName: username });

        if (userInHana.length > 0) {
            await db.update(Users).set({ isDeleted: true }).where({ UserName: username });
            console.log(`Administrator with username ${username} marked as deleted in HANA DB.`);
        }

        const base64Credentials = Buffer.from(`${IDP_USERNAME}:${IDP_PASSWORD}`, "utf-8").toString("base64");
        const headers = {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/scim+json",
        };

        const idpResponse = await axios.get(
            `${IDP_ENDPOINT}/scim/Users?filter=emails.value eq "${username}"`,
            { headers }
        );
        if (idpResponse.data.Resources && idpResponse.data.Resources.length > 0) {
            const userId = idpResponse.data.Resources[0].id;
            await axios.delete(`${IDP_ENDPOINT}/scim/Users/${userId}`, { headers });
            console.log(`User with username ${username} deleted successfully from IDP.`);
        }
    } catch (err) {
        console.error("Error deleting administrator", err);
        return req.reject(500, `Failed to delete administrator: ${err.message}`);
    }
}

module.exports = {
    getAdministrators, createAdministrator, editAdministrator, deleteAdministrator
}