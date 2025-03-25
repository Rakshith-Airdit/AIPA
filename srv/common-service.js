const cds = require("@sap/cds");
const connectDB = require("../lib/db-connect");
const axios = require("axios");
const env = require("dotenv").config();
const { Users, Departments, RoleAssignment, userType, Vendors } = cds.entities('Common');
const IDP_USERNAME = process.env.IDP_USERNAME;
const IDP_PASSWORD = process.env.IDP_PASSWORD;
const IDP_ENDPOINT = process.env.IDP_ENDPOINT;
const connectionString = process.env.AZURE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;
const fileUpload = require('express-fileupload');

// Use the unified dynamic query builder helper along with the other helpers.
const {
    buildDynamicQuery,
    uploadImageToAzure, deleteImageFromAzure
} = require('../lib/helpers');

module.exports = cds.service.impl(async (srv) => {
    const db = await connectDB();
    // const tables = await db.model.definitions;

    // Dashboard Page - UserCount remains unchanged
    srv.on("READ", "UserCount", async (req) => {
        try {
            const now = new Date();
            const ninetyDaysAgo = new Date(now);
            ninetyDaysAgo.setDate(now.getDate() - 90);
            const sixtyDaysAgo = new Date(now);
            sixtyDaysAgo.setDate(now.getDate() - 60);

            // Initialize role counts
            const roleCounts = {
                Supr: { active: 0, inactive: 0, usercount: 0, users: [] },
                Pwr: { active: 0, inactive: 0, usercount: 0, users: [] },
                Qua: { active: 0, inactive: 0, usercount: 0, users: [] },
                "Cor.Qua": { active: 0, inactive: 0, usercount: 0, users: [] },
                Bus: { active: 0, inactive: 0, usercount: 0, users: [] },
                Str: { active: 0, inactive: 0, usercount: 0, users: [] },
                Fld: { active: 0, inactive: 0, usercount: 0, users: [] },
            };

            // Role mapping
            const roleMap = {
                "Super User": "Supr",
                "Power User": "Pwr",
                "Quality User": "Qua",
                "Corporate Quality User": "Cor.Qua",
                "Business User": "Bus",
                "Store User": "Str",
                "Field User": "Fld",
            };

            // Initialize department counts
            const departments = await db.read(Departments);
            const departmentCounts = {};
            departments.forEach((dept) => {
                departmentCounts[dept.name] = {
                    totalCount: 0,
                    usercount: 0,
                    users: [],
                };
            });

            let whereClause = {};
            let filterType = req.query.SELECT.from.ref[0];

            // Handle filter type (activeusers, inactiveusers, usrthirty)
            switch (filterType) {
                case 'activeusers':
                    whereClause.lastLoggedInTime = { '>=': ninetyDaysAgo };
                    break;
                case 'inactiveusers':
                    whereClause.lastLoggedInTime = { '<=': ninetyDaysAgo };
                    break;
                case 'usrthirty':
                    whereClause.lastLoggedInTime = { '<=': sixtyDaysAgo };
                    break;
                default:
                    break;
            }

            // Process additional filters manually here (if still needed)
            // Note: This is outside of the unified dynamic query builder
            if (req.query.SELECT.where) {
                req.query.SELECT.where.forEach((condition, index) => {
                    if (index % 2 === 0 && condition.ref && req.query.SELECT.where[index + 1] === '=') {
                        const field = condition.ref[0];
                        const value = req.query.SELECT.where[index + 2].val;
                        whereClause[field] = value;
                    }
                });
            }

            // Fetch users from HANA using db.read
            const users = await db.read(Users).where(whereClause);

            // Iterate over users to update role counts and department counts
            users.forEach((user) => {
                if (!user.lastLoggedInTime) return;

                const lastLoginDate = new Date(user.lastLoggedInTime);
                const isInactive = lastLoginDate < ninetyDaysAgo;
                const isGoingToInactive = lastLoginDate < sixtyDaysAgo;
                const role = user.adminType;

                // Update role counts and add user to the list
                if (roleMap[role]) {
                    const mappedRole = roleMap[role];
                    if (isInactive) {
                        roleCounts[mappedRole].inactive++;
                    } else {
                        roleCounts[mappedRole].active++;
                    }
                    roleCounts[mappedRole].usercount++;
                    roleCounts[mappedRole].users.push({
                        name: `${user.name} ${user.lastname}` || user.name || "",
                        username: user.username || "",
                        imageUrl: user.imageUrl || "",
                        adminType: user.adminType || "",
                        isInactive: isInactive,
                        isGoingToInactive: isGoingToInactive,
                    });
                }

                // Update department counts
                if (user.departments && user.departments[0]) {
                    const deptName = user.departments[0].name;
                    if (departmentCounts[deptName]) {
                        departmentCounts[deptName].totalCount++;
                        departmentCounts[deptName].usercount++;
                        departmentCounts[deptName].users.push({
                            name: user.name || "",
                            username: user.username || "",
                            imageUrl: user.imageUrl || "",
                            adminType: user.adminType || "",
                            isInactive: isGoingToInactive,
                        });
                    }
                }
            });

            // Prepare combined result for roles and departments
            const roleResults = Object.keys(roleCounts).map((role) => ({
                adminType: role,
                activeCount: roleCounts[role].active,
                inactiveCount: roleCounts[role].inactive,
                usercount: roleCounts[role].usercount,
                users: roleCounts[role].users,
            }));

            const deptResults = Object.keys(departmentCounts).map((dept) => ({
                deptType: dept,
                totalCount: departmentCounts[dept].totalCount,
                usercount: departmentCounts[dept].usercount,
                users: departmentCounts[dept].users,
            }));

            const result = {
                roles: roleResults,
                departments: deptResults,
                totalRoles: roleResults.length,
                totalDepartments: deptResults.length,
            };

            return { data: result };
        } catch (error) {
            console.error("Error fetching user counts:", error.message);
            return { error: "Error fetching user counts" };
        }
    });

    // Dashboard Page - UserAttributes remains unchanged
    srv.on("READ", "UserAttributes", async (req) => {
        const email = req.user.id;
        const userTypeHeader = req.headers["usertype"];

        try {
            if (userTypeHeader === "ext") {
                const base64Credentials = Buffer.from(`${IDP_USERNAME}:${IDP_PASSWORD}`, "utf-8").toString("base64");
                const headers = { Authorization: `Basic ${baseP64Credentials}` };

                let startIndex = 1;
                const count = 100; // Number of items per page
                let userFound = false;
                let matchingUser = null;

                while (!userFound) {
                    const response = await axios.get(`${IDP_ENDPOINT}/scim/Users`, {
                        headers,
                        params: { startIndex, count }
                    });
                    const users = response.data.Resources || [];
                    matchingUser = users.find((user) => user.emails.some((emailObj) => emailObj.value === req.user.id));
                    if (matchingUser) break;
                    const totalResults = response.data.totalResults || 0;
                    if (startIndex + count > totalResults) break;
                    startIndex += count;
                }

                if (!matchingUser) {
                    return req.reject(404, "User not found");
                }

                const customAttributes = matchingUser["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"]?.attributes || [];
                const departmentAttribute = customAttributes.find((attr) => attr.name === "customAttribute2");

                const userInDb = await db.read(Users).where({ email: email }).limit(1);
                if (!userInDb || userInDb.length === 0) {
                    return req.reject(404, "User not found in database");
                }
                const user = userInDb[0];
                const departmentName = user.departments
                    ? user.departments[0].name
                    : departmentAttribute ? departmentAttribute.value : null;

                const departmentId = await db.read(Departments).where({ name: departmentName }).limit(1);
                const departmentIdResult = departmentId.length > 0 ? departmentId[0]._id : null;

                await db.update("Users").set({ lastLoggedInTime: new Date() }).where({ _id: user._id });

                const role = user.adminType;
                const phone = user.phone;
                const signurl = user?.signurl ?? "";
                const imageurl = user.imageurl;
                const name = `${user.name} ${user.lastname}`;

                if (role === "Field User") {
                    return {
                        role,
                        departmentName,
                        departmentId: departmentIdResult,
                        email,
                        phone,
                        name,
                        imageurl,
                        UserName: user.UserName,
                    };
                } else {
                    const roleDoc = await db.read(RoleAssignment).where({ adminType: role }).limit(1);
                    if (!roleDoc || roleDoc.length === 0) {
                        return req.reject(404, "Roles not found for admin type");
                    }
                    const roles = roleDoc[0].allowedApps;
                    return {
                        role,
                        departmentName,
                        departmentId: departmentIdResult,
                        email,
                        phone,
                        name,
                        imageurl,
                        roles,
                        signurl,
                    };
                }
            } else {
                const userInDb = await db.read(Users).where({ email: email }).limit(1);
                if (!userInDb || userInDb.length === 0) {
                    return req.reject(404, "User not found in database");
                }
                const user = userInDb[0];
                const role = user.adminType;
                const phone = user.phone;
                const departmentName = user.departments ? user.departments[0].name : null;
                const departmentId = await db.read(Departments).where({ name: departmentName }).limit(1);
                const departmentIdResult = departmentId.length > 0 ? departmentId[0]._id : null;
                const imageurl = user.imageurl;
                const adminType = user.adminType;
                const name = user.name;
                const signurl = user.signurl ?? "";
                const roleDoc = await db.read(RoleAssignment).where({ adminType: adminType }).limit(1);
                if (!roleDoc || roleDoc.length === 0) {
                    return req.reject(404, "Roles not found for admin type");
                }
                const roles = roleDoc[0].allowedApps;
                return {
                    role,
                    departmentName,
                    departmentId: departmentIdResult,
                    email,
                    phone,
                    name,
                    imageurl,
                    roles,
                    signurl,
                };
            }
        } catch (error) {
            console.error("Error fetching user attributes and roles:", error.message);
            return req.reject(500, "Internal Server Error");
        }
    });

    srv.on("READ", "AllUserType", async (req) => {
        try {
            const allUserTypes = await db.read(userType);
            userType["$count"] = userType.length;
            return allUserTypes;
        } catch (err) {
            console.error("Failed to fetch data from HANA", err);
            req.reject(500, "Failed to fetch data from HANA");
        }
    });

    srv.on("READ", "DepartmentDisplay", async () => {
        try {
            const deptType = await db.read(Departments).columns("ID", "name", "postalCode");
            const allUserTypes = await db.read(userType);
            return { department: deptType, userType: allUserTypes };
        } catch (err) {
            console.error(err, "Failed to fetch data from HANA");
            throw new Error("Failed to fetch data from HANA");
        }
    });

    srv.on("CREATE", "Vendors", async (req) => {
        let { res } = req.http;
        try {
            const { name, img, imagefilename, departmentName, createdByEmailID, shortname, type } = req.data;

            if (!name || !departmentName || !createdByEmailID || !shortname || !type) {
                return req.reject(400, "Missing required fields. Please ensure name, departmentName, shortname, type, and createdByEmailID are provided.");
            }
            if (!img || !imagefilename) {
                return req.reject(400, "Vendor image and filename are required.");
            }

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
    });

    // Vendors READ endpoint using the unified dynamic query builder
    srv.on("READ", "Vendors", async (req) => {
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
    });

    srv.on("PUT", "Vendors", async (req) => {
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
    });

    // Administrators READ endpoint using the unified dynamic query builder
    srv.on("READ", "Administrators", async (req) => {
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
    });

    srv.on("CREATE", "Administrators", async (req) => {
        try {
            const { username, name, lastname, phone, adminType, departments, imageurl, imagefilename } = req.data;
            const now = new Date();
            const formattedDate = now.toISOString();

            const fileUrl = await uploadImageToAzure(username, imageurl, imagefilename);
            const typeMapping = {
                "Power User": 1,
                "Quality User": 7,
                "Corporate Quality User": 7,
                "Business User": 10,
            };
            const type = typeMapping[adminType] ?? 1;

            const administratorData = {
                username,
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

            await db.insert("your.namespace.Administrators").entries(administratorData);
            return administratorData;
        } catch (err) {
            console.error("Error inserting administrator into HANA DB", err);
            return req.reject(500, "Unable to insert data");
        }
    });

    srv.on("PUT", "Administrators", async (req) => {
        try {
            const username = req.params[0].username;
            const { name, lastname, phone, adminType, departments, imageurl, imagefilename } = req.data;

            const result = await db.read("your.namespace.Administrators").where({ username });
            if (result.length === 0) {
                return req.reject(404, `Administrator with username ${username} not found`);
            }
            const existingUser = result[0];

            let fileUrl = existingUser.imageurl;
            if (imageurl && imagefilename) {
                if (existingUser.imagefilename && existingUser.imagefilename !== imagefilename) {
                    await deleteImageFromAzure(`${username}_${existingUser.imagefilename}`);
                }
                fileUrl = await uploadImageToAzure(username, imageurl, imagefilename);
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

            const updated = await db.update("your.namespace.Administrators")
                .set(updateData)
                .where({ username });
            if (updated === 1) {
                return { message: `Administrator with username ${username} updated successfully` };
            } else {
                return req.reject(404, `Administrator with username ${username} not found`);
            }
        } catch (err) {
            console.error("Error updating administrator in HANA DB", err);
            return req.reject(500, "Failed to update administrator");
        }
    });

    srv.on("DELETE", "Administrators", async (req) => {
        try {
            const username = req.params[0].username;
            console.log(`Attempting to delete administrator with username: ${username}`);

            const userInHana = await db.read(Users).where({ username });
            if (userInHana.length > 0) {
                await db.update(Users).set({ isDeleted: true }).where({ username });
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
    });

    // Uncomment this block for file upload testing if needed.
    // srv.on("CREATE", "Test", async (req) => {
    //     if (!req._.req?.files || !req._.req.files.UploadedFile) {
    //         throw new Error("No file uploaded.");
    //     }
    //     const file = req._.req.files.UploadedFile;
    //     console.log("📁 File received:", file.name);
    //     return {
    //         fileName: file.name,
    //         buffer: file.data,
    //         size: file.size,
    //         mimeType: file.mimetype
    //     };
    // });
});
