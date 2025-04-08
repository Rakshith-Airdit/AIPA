const { connectDB } = require("../lib/db-connect");
const { Users, userType } = cds.entities('Common');
const {
    buildDynamicQuery,
    uploadImageToAzure, deleteImageFromAzure,
} = require('../lib/helpers');
const { IDP_USERNAME, IDP_PASSWORD, IDP_ENDPOINT, AZURE_CONNECTION_STRING: connectionString, AZURE_CONTAINER_NAME: containerName } = process.env;
const axios = require("axios");
let db;

(async () => {
    db = await connectDB();
})();

async function createBTPUser(req) {
    try {
        const {
            username,
            name,
            lastname,
            phone,
            adminType,
            departmentName,
            departmentId,
            imageurl,
            imagefilename,
        } = req.data;

        const fileUrl = await uploadImageToAzure(
            username,
            imageurl,
            imagefilename, connectionString, containerName
        );

        if (adminType === "Field User") {
            const userData = {
                schemas: [
                    "urn:ietf:params:scim:schemas:core:2.0:User",
                    "urn:sap:cloud:scim:schemas:extension:custom:2.0:User",
                ],
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
                        {
                            name: "customAttribute1",
                            value: adminType,
                        },
                        {
                            name: "customAttribute2",
                            value: departmentName,
                        },
                    ],
                },
            };

            const base64Credentials = Buffer.from(
                `${IDP_USERNAME}:${IDP_PASSWORD}`,
                "utf-8"
            ).toString("base64");

            const headers = {
                Authorization: `Basic ${base64Credentials}`,
                "Content-Type": "application/scim+json",
            };

            const response = await axios.post(
                `${IDP_ENDPOINT}/service/scim/Users`,
                userData,
                { headers }
            );

            console.log("User created successfully:", response.data);
        }

        const type = (() => {
            switch (
            adminType // adminType ??
            ) {
                case "Super User":
                    return 0;
                case "Power User":
                    return 1;
                case "Field User":
                    return 2;
                case "Quality User":
                case "Corporate Quality User":
                    return 7;
                case "Store User":
                    return 8;
                case "Business User":
                    return 10;
                default:
                    return -1;
            }
        })();

        const existingUser = await db.read(Users).where({ UserName: email });

        if (existingUser.length > 0) {
            return req.error(400, "User already exists");
        }

        if (userType === "power" || userType === "quality") {
            const usersInDepartment = await db.read("Users").where({
                or: [
                    { username: username },
                    { UserName: username },
                    { email: username },
                ]
            });


            if (usersInDepartment.length > 0) {
                return req.error(
                    400,
                    `A user already exists in the ${departmentName} department`
                );
            }
        }

        const newRecord = {
            name,
            lastname,
            username,
            phone,
            UserName: username,
            adminType,
            imageurl: fileUrl,
            isDeleted: false,
            type: type,
            imagefilename,
            department_name: departmentName,
            department_ID: departmentID,
            createdDateTime: new Date(),
            lastLoggedInTime: new Date(),
        };

        const res = db.create(Users).entries(newRecord)

        var respon = {
            ...newRecord,
            id: res.insertedId.toString(),
        };

        return respon;
    } catch (err) {
        console.error("Error creating user:", err.message);
        req.reject(500, "Failed to create user");
    }
}

async function getBTPUser(req) {
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);

    try {
        const { query, sort, pagination } = await buildDynamicQuery(req, ["adminType", "departmentName"]);

        query.isDeleted = false;
        query.type = { in: [1, 7, 10] };

        let users = await db.read(Users).where(query).orderBy(sort).limit(pagination.top.val, pagination.skip);

        // Loop through the users and apply the required transformations
        for (const user of users) {
            // Set isActive based on lastLoggedInTime
            if (user.lastLoggedInTime && user.lastLoggedInTime < ninetyDaysAgo) {
                user.isActive = false;
            } else {
                user.isActive = true;
            }

            // Process name fields
            if (user.name && user.lastname) {
                user.name = `${user.name}`;
            } else if (user.name) {
                user.name = user.name;
            } else if (user.lastname) {
                user.name = user.lastname;
            } else {
                user.name = null;
            }
        }

        // Prepare the result and map required fields
        const result = users;

        // Add the total count of matching users
        result["$count"] = (await db.read(Users).where(query).limit(pagination.top.val, pagination.skip)).length;

        return result;
    } catch (err) {
        console.error("Error fetching data:", err);
        req.reject(500, "Failed to fetch data from HANA");
    }
}

async function editBTPUser(req) {
    try {
        const username = req.params[0].username;

        const {
            phone,
            name,
            lastname,
            adminType,
            departmentName,
            departmentId,
            imageurl,
            imagefilename,
        } = req.data;

        const user = await db.read(Users).where({ UserName: username });

        if (!user) {
            return req.error(404, `User with username ${username} not found`);
        }

        let fileUrl = user.imageurl;

        if (imageurl && imagefilename) {
            // Delete the old image from Azure if it exists
            if (user.imagefilename && user.imagefilename !== imagefilename) {
                await deleteImageFromAzure(`${username}_${existingUser.imagefilename}`, connectionString, containerName);
            }

            // Upload the new image
            fileUrl = await uploadImageToAzure(
                username,
                imageurl,
                imagefilename, connectionString, containerName
            );
        }
        const newRecord = {
            phone,
            adminType,
            department_name: departmentName,
            department_ID: departmentId,
            imageurl: fileUrl,
            imagefilename,
        };

        const dbResult = await db.update(Users).set(newRecord).where({ UserName: username });

        if (dbResult.length === 0) {
            req.error(404, "Document not found");
            return;
        }

        console.log("Document updated successfully in DB");

        if (adminType === "Field User") {
            const userData = {
                schemas: [
                    "urn:ietf:params:scim:schemas:core:2.0:User",
                    "urn:sap:cloud:scim:schemas:extension:custom:2.0:User",
                ],
                userName: name,
                emails: [{ value: username, type: "work", primary: true }],
                phoneNumbers: [{ value: phone, type: "mobile" }],
                "urn:sap:cloud:scim:schemas:extension:custom:2.0:User": {
                    attributes: [
                        {
                            name: "customAttribute1",
                            value: adminType,
                        },
                        {
                            name: "customAttribute2",
                            value: departmentName,
                        },
                    ],
                },
            };


            // Prepare headers for the IDP request
            const base64Credentials = Buffer.from(
                `${IDP_USERNAME}:${IDP_PASSWORD}`,
                "utf-8"
            ).toString("base64");

            const headers = {
                Authorization: `Basic ${base64Credentials}`,
                "Content-Type": "application/scim+json",
            };


            // Check if user exists in IDP
            const idpResponse = await axios.get(
                `${IDP_ENDPOINT}/scim/Users?filter=emails.value eq "${username}"`,
                { headers }
            );

            if (
                idpResponse.data.Resources &&
                idpResponse.data.Resources.length > 0
            ) {
                const userId = idpResponse.data.Resources[0].id;
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

            console.log("Document updated successfully in DB and IDP");
        }

        return dbResult;
    } catch (err) {
        console.error("Error updating user:", err.message);
        req.reject(500, "Failed to update user");
    }
}

module.exports = {
    createBTPUser, getBTPUser, editBTPUser
}