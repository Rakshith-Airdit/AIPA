const axios = require("axios");
const { connectDB } = require("../lib/db-connect");
const { Users, Departments,
    Vendors, ActivityLogs } = cds.entities('Common');
const {
    uploadImageToAzure,
    getUserType, isInternalEmail, isExternalEmail, sendEmail
} = require('../lib/helpers');
const { IDP_USERNAME, IDP_PASSWORD, IDP_ENDPOINT, AZURE_CONNECTION_STRING: connectionString, AZURE_CONTAINER_NAME: containerName } = process.env;

let db;

(async () => {
    db = await connectDB();
})();

async function createUser(req) {
    const data = req.data;
    const {
        username, name, lastname, phone, adminType,
        departments, imageurl, vendors, createdByMailID,
        createdBy, signature
    } = data;

    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);
    let getAdminType = getUserType(adminType);
    let extraPayload = {};
    let dept;

    try {
        // Duplicate username check using HANA query
        const userExists = await db.read(Users).where({ UserName: username, isDeleted: false });

        if (userExists.length > 0) {
            return { message: 'User with this EmailId already exists', status: 400 };
        }


        // Delete user with isDeleted = true (soft delete) if exists
        await db.delete(Users).where({ UserName: username, isDeleted: true });

        // Admin type specific logic
        switch (getAdminType) {
            // Super User
            case 0:
                const superUserExists = await db.read("Users").where({
                    type: 0, adminType: 'Super User', isDeleted: false
                });
                if (superUserExists.length > 0) {
                    return { message: 'A Super User already exists', status: 400 };
                }
                if (!isInternalEmail(username)) {
                    return { message: 'Super User must have an internal email', status: 400 };
                }
                break;

            // Power User
            case 1:
                if (!departments) return { message: 'Departments must be provided for Power User', status: 400 };

                const powerUserExists = await db.read(Users).where({
                    type: 1, 'departments.name': { in: [departments] }
                });

                if (powerUserExists.length > 0) {
                    return { message: `Power User for department ${departments} already exists`, status: 400 };
                }

                if (!isInternalEmail(username)) return { message: 'Power User must be within an Organization', status: 400 };

                if (signature) {
                    extraPayload['signurl'] = await uploadImageToAzure(name, signature, `sign_${Date.now()}.jpg`, connectionString, containerName);
                } else {
                    return { message: 'Signature must be provided for Power User', status: 400 };
                }

                break;

            // Field User
            case 2:
                if (!departments) return { message: 'Departments must be provided for Field User', status: 400 };
                if (!isExternalEmail(username)) return { message: 'Field User username must not be internal', status: 400 };
                const department = await db.read(Departments).where({ name: { in: [departments] } }).limit(1);

                if (!department.length) return { message: 'Invalid department for Field User', status: 400 };

                const newActivityLog = {
                    username, department_Id: department[0].ID, department_name: departments[0], activity: 'User Created',
                    timestamp: new Date(), isDeleted: false
                }

                await db.insert(ActivityLogs).entries(newActivityLog);

                break;

            // Quality User
            case 7:
                if (signature) {
                    extraPayload['signurl'] = await uploadImageToAzure(name, signature, `sign_${Date.now()}.jpg`, connectionString, containerName);
                } else {
                    return { message: `Signature must be provided for ${adminType}`, status: 400 };
                }
                break;

            // Store User
            case 8:
                if (vendors) {
                    var vendorId = await db.read(Vendors).columns("ID").where({ name: vendors });
                    extraPayload['vendor'] = {
                        _id: vendorId.ID,
                        name: vendors
                    };
                }

            // Business User
            case 10:
                if (signature) {
                    extraPayload['signurl'] = await uploadImageToAzure(name, signature, `sign_${Date.now()}.jpg`, connectionString, containerName);
                } else {
                    return { message: `Signature must be provided for ${adminType}`, status: 400 };
                }
                break;

            default:
                return { message: 'Invalid adminType', status: 400 };
        }

        // Handle departments (Power User, Field User, Business User)
        if (departments && adminTypes !== 0 && adminType !== 'Corporate Quality User') {

            const departmentIds = await db.read(Departments).where({
                name: { in: departments }
            }).columns("ID", "name");

            console.log(departmentIds);
            return departmentIds;

            dept = departmentIds.map(department => ({
                _id: department.ID,
                name: department.name
            }));
        } else {
            dept = [{ name: null }];
        }

        // Image URL upload (if exists)
        let fileUrl = '';
        if (imageurl && imageUrl === '') {
            fileUrl = await uploadImageToAzure(name, imageurl, `user_${Date.now()}.jpg`, connectionString, containerName);
        }

        const payload = {
            username, name, lastname, phone, adminType, departments: dept,
            imageurl: fileUrl, createdByMailID, createdBy, type: adminTypes,
            UserName: username, ...extraPayload
        };

        // Directly merge payload with defaults
        const defaultDocument = {
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
            privilege: {} // Add other default fields here as necessary
        };

        // Assuming `payload` is already defined
        const mergedDocument = { ...defaultDocument, ...payload };

        // If payload contains a 'privilege' field, merge it with the default privilege object
        if (payload.privilege) {
            mergedDocument.privilege = { ...defaultDocument.privilege, ...payload.privilege };
        }

        await db.insert(Users).entries(mergedDocument);

        // Send a welcome email if it's an internal user
        if (isInternalEmail(username)) {
            const subject = 'Welcome to the AGP System';
            const text = `Dear ${name} ${lastname},\n\nYour account has been created successfully. Please log in using your Outlook.\n\nBest regards,\nAdmin Team`;
            await sendEmail(username, subject, text);
        } else {
            const userData = {
                schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
                userName: data.name,
                name: {
                    givenName: data.name,
                    familyName: data.lastname
                },
                emails: [{ value: data.username || "", type: "work", primary: true }],
                active: true,
                phoneNumbers: [{ value: data.phone, type: "mobile" }],
                "urn:sap:cloud:scim:schemas:extension:custom:2.0:User": {
                    attributes: [
                        {
                            name: "customAttribute1",
                            value: "Field User",
                        },
                        {
                            name: "customAttribute2",
                            value: (Array.isArray(data.departments) && data.departments.length > 0) ? data.departments.toString() : ""
                        }
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
            return { status: 200, message: response };
        }

        return { status: 200, message: 'User has been successfully inserted' };

    } catch (error) {
        console.error('Error creating user:', error);
        // return { message: error.message || 'Error creating user', status: 500 };
        req.reject(500, error.message)
    }
}

async function getUsers(req) {
    // const users = await db.run(SELECT.from(Users))
    const users = await db.read(Users);
    return users;
}

async function editUser(req) {
    try {
        const userEmail = req.params[0].username;
        const data = req.data;
        const { adminType, phone, name, lastname, imageurl, signature, departments } = data;

        // Fetch existing user from HANA DB using the Users entity
        const existingUser = await db.read(Users).where({ UserName: userEmail });
        if (!existingUser) {
            req.reject(400, 'User not found');
            return;
        }

        // Determine the admin type using helper function
        const adminTypes = getUserType(adminType);
        let extraPayload = {};

        switch (adminTypes) {
            case 0: // Super User
                // Check if Super User meets the internal email requirement
                const superUserExists = await db.read(Users).where({ adminType: 0 });
                if (userEmail && !isInternalEmail(userEmail)) {
                    req.reject(400, 'Super User must have an internal Email ending with @agpppratham.com');
                    return;
                }
                if (signature) {
                    extraPayload.signurl = await uploadImageToAzure(name, signature, `sign_${Date.now()}.jpg`, connectionString, containerName);
                }
                break;

            case 1: // Power User
                if (userEmail && !isInternalEmail(userEmail)) {
                    req.reject(400, 'Power User must have an internal username ending with @agpppratham.com');
                    return;
                }
                if (signature) {
                    extraPayload.signurl = await uploadImageToAzure(name, signature, `sign_${Date.now()}.jpg`, connectionString, containerName);
                }
                break;

            case 2: // Field User
                let departmentRecords = [];
                if (departments) {
                    // Assuming departments is an array (or can be converted to an array)
                    // Query departments that match any name in the provided departments array
                    departmentRecords = await db.read(Departments).where({ name: { in: departments } });
                }

                if (departmentRecords.length > 0) {
                    // Create an activity log record for each department found
                    for (const dept of departmentRecords) {
                        const newActivityRecord = {
                            formDescription: null,
                            version: null,
                            taskName: null,
                            taskID: null, // Using taskID per CDS definition
                            deviceModel: 'Web Application',
                            source: null,
                            formID: null, // Using formID per CDS definition
                            username: userEmail,
                            deviceUUID: null,
                            adminName: null, // Using adminName per CDS definition
                            formName: null,
                            recordID: null, // Using recordID per CDS definition
                            // Association as object using the department record
                            department: { ID: dept.ID.toString() },
                            activity: 'User Updated',
                            timestamp: new Date(),
                            isDeleted: false,
                            departmentName: dept.name
                        };

                        await db.create(ActivityLogs).entries(newActivityRecord);
                    }
                } else {
                    // No departments found or provided; create one log record with department as null.
                    const newActivityRecord = {
                        formDescription: null,
                        version: null,
                        taskName: null,
                        taskID: null, // Using taskID per CDS definition
                        deviceModel: 'Web Application',
                        source: null,
                        formID: null, // Using formID per CDS definition
                        username: userEmail,
                        deviceUUID: null,
                        adminName: null, // Using adminName per CDS definition
                        formName: null,
                        recordID: null, // Using recordID per CDS definition
                        department: null,
                        activity: 'User Updated',
                        timestamp: new Date(),
                        isDeleted: false,
                        departmentName: departments ? departments.toString() : ''
                    };

                    await db.create(ActivityLogs).entries(newActivityRecord);
                }

                break;
            // Quality User or Corporate Quality User
            case 7:
                if (Array.isArray(departments) && departments.length > 0 && adminType === 'Corporate Quality User') {
                    req.reject(400, 'Corporate Quality User should not have a department');
                    return;
                }
                if (signature) {
                    extraPayload.signurl = await uploadImageToAzure(name, signature, `sign_${Date.now()}.jpg`, connectionString, containerName);
                }
                break;

            // Store User (8) and Business User (10)
            case 8:
            case 10:
                if (signature) {
                    extraPayload.signurl = await uploadImageToAzure(name, signature, `sign_${Date.now()}.jpg`, connectionString, containerName);
                }
                break;

            default:
                req.reject(400, 'Invalid adminType');
                return;
        }

        // Upload user image if provided
        if (imageurl) {
            extraPayload.imageurl = await uploadImageToAzure(name, imageurl, `user_${Date.now()}.jpg`, connectionString, containerName);
        }

        // Build payload merging new data with existing user data
        const payload = {
            name: name || existingUser.name,
            lastname: lastname || existingUser.lastname,
            phone: phone || existingUser.phone,
            adminType: adminType || existingUser.adminType,
            type: adminTypes,
            ...extraPayload
        };

        // For external users, update external IDP inline
        if (!isInternalEmail(userEmail)) {
            try {
                const userData = {
                    schemas: [
                        "urn:ietf:params:scim:schemas:core:2.0:User",
                        "urn:sap:cloud:scim:schemas:extension:custom:2.0:User"
                    ],
                    userName: data.name,
                    emails: [{ value: userEmail, type: "work", primary: true }],
                    phoneNumbers: [{ value: data.phone, type: "mobile" }],
                    "urn:sap:cloud:scim:schemas:extension:custom:2.0:User": {
                        attributes: [
                            {
                                name: "customAttribute1",
                                value: data.adminType,
                            },
                            {
                                name: "customAttribute2",
                                value: (Array.isArray(data.departments) && data.departments.length > 0) ? data.departments.toString() : "",
                            }
                        ]
                    }
                };

                const base64Credentials = Buffer.from(`${IDP_USERNAME}:${IDP_PASSWORD}`, "utf-8").toString("base64");
                const headers = {
                    Authorization: `Basic ${base64Credentials}`,
                    "Content-Type": "application/scim+json",
                };

                // Check if user exists in IDP
                const idpQueryResponse = await axios.get(
                    `${IDP_ENDPOINT}/scim/Users?filter=emails.value eq "${userEmail}"`,
                    { headers }
                );

                if (idpQueryResponse.data.Resources && idpQueryResponse.data.Resources.length > 0) {
                    const userId = idpQueryResponse.data.Resources[0].id;
                    const updateResponse = await axios.put(
                        `${IDP_ENDPOINT}/scim/Users/${userId}`,
                        userData,
                        { headers }
                    );
                    console.log("User updated successfully in IDP:", updateResponse.data);
                } else {
                    console.error("User not found in IDP");
                    req.reject(404, "User not found in IDP");
                    return;
                }
            } catch (idpError) {
                console.error("Error updating user in IDP:", idpError.message);
                req.reject(400, "Error Updating the User In IDP");
                return;
            }
        }

        // Update user in HANA DB using REST API–styled query
        await db.update(Users)
            .set(payload)
            .where({ UserName: userEmail });

        // Send welcome email if the user has an internal email address
        if (isInternalEmail(userEmail)) {
            const subject = 'Welcome to the AGP System';
            const text = `Dear ${name} ${lastname},

Your account has been Updated Successfully. Please Login using your Outlook.

Best regards,
Admin Team`;
            await sendEmail(userEmail, subject, text);
        }

        return { username: req.data.username, status: 200, message: 'User has been successfully Updated' };
    } catch (error) {
        console.error('Error updating user:', error);
        req.reject(400, 'An error occurred while updating the user');
    }
}

async function deleteUser(req) {
    try {
        const userEmail = req.params[0].username;

        // Fetch the user from HANA DB using REST–styled query
        const existingUser = await db.read(Users).where({ UserName: userEmail });

        if (!existingUser) {
            req.reject(400, 'User not found in HANA DB');
            return;
        }

        // Prevent deletion of Super User
        if (existingUser.adminType === "Super User") {
            req.reject(400, 'Cannot delete the Super User');
            return;
        }

        // Mark the user as deleted in HANA DB (REST–styled update query)
        await db.update(Users)
            .set({ isDeleted: true })
            .where({ UserName: userEmail });

        // Set up basic authentication for the IDP API
        const base64Credentials = Buffer.from(`${IDP_USERNAME}:${IDP_PASSWORD}`, "utf-8").toString("base64");

        const headers = {
            Authorization: `Basic ${base64Credentials}`,
            "Content-Type": "application/scim+json"
        };

        // Check if user exists in IDP
        const idpResponse = await axios.get(
            `${IDP_ENDPOINT}/scim/Users?filter=emails.value eq "${userEmail}"`,
            { headers }
        );

        let message = "";

        if (idpResponse.data.Resources && idpResponse.data.Resources.length > 0) {
            const userId = idpResponse.data.Resources[0].id;
            // Delete the user from IDP if found
            await axios.delete(`${IDP_ENDPOINT}/scim/Users/${userId}`, { headers });
            message = 'User deleted successfully from both HANA DB and IDP';
        } else {
            message = 'User marked as deleted in HANA DB, but not found in IDP';
        }

        return { username: userEmail, message, status: 200 };
    } catch (error) {
        console.error('Error deleting user:', error);
        req.reject(500, 'An error occurred while deleting the user');
    }
}

module.exports = {
    createUser, getUsers, editUser, deleteUser
}