const { connectDB } = require("../lib/db-connect");
const { Users, Departments,
    RoleAssignment, userType,
    Vendors, DocumentUploads } = cds.entities('Common');
// const { ActivityBackfilling } = cds.entities('Activity');
const IDP_USERNAME = process.env.IDP_USERNAME;
const IDP_PASSWORD = process.env.IDP_PASSWORD;
const IDP_ENDPOINT = process.env.IDP_ENDPOINT;
const connectionString = process.env.AZURE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;
const {
    buildDynamicQuery,
    uploadImageToAzure, checkBtpUserExists, deleteImageFromAzure,
    getUserType, isInternalEmail, isExternalEmail, sendEmail, DateFilter
} = require('../lib/helpers');
const axios = require("axios");

let db;

(async () => {
    db = await connectDB();
})();

async function GetAdminType(UserType, departmentName) {
    try {
        if (UserType === 1) {
            // Use CAP syntax to check for a Power User in the given department.
            let powerUserCheck = await db.read(Users).where({ "departments_name": departmentName, adminType: "Power User" });
            if (powerUserCheck && powerUserCheck.length > 0) {
                return ["Quality User", "Corporate Quality User", "Business User", "Store User"];
            }
            return ["Power User", "Quality User", "Corporate Quality User", "Business User", "Store User"];
        }
        return ["Quality User", "Business User", "Corporate Quality User", "Store User", "Field User"];
    } catch (err) {
        console.error("Error in GetAdminType:", err);
        switch (UserType) {
            case 1:
                return ["Power User", "Quality User", "Corporate Quality User", "Business User", "Store User"];
            case 2:
                return ["Quality User", "Business User", "Corporate Quality User", "Store User", "Field User"];
            default:
                return [];
        }
    }
}

async function getUserCount(req) {
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
}

async function getUserAttributes(req) {
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

            const userInDb = await db.read(Users).where({ UserName: email }).limit(1);
            if (!userInDb || userInDb.length === 0) {
                return req.reject(404, "User not found in database");
            }
            const user = userInDb[0];
            const departmentName = user.departments_name
                ? user.departments_name
                : departmentAttribute ? departmentAttribute.value : null;
            // const departmentName = user.departments
            //     ? user.departments[0].name
            //     : departmentAttribute ? departmentAttribute.value : null;

            const departmentId = await db.read(Departments).where({ name: departmentName }).limit(1);
            const departmentIdResult = departmentId.length > 0 ? departmentId[0].ID : null;

            await db.update(Users).set({ lastLoggedInTime: new Date() }).where({ ID: user.ID });

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
            const userInDb = await db.read(Users).where({ UserName: email }).limit(1);
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
}

async function getAllUserType(req) {
    try {
        const allUserTypes = await db.read(userType);
        userType["$count"] = userType.length;
        return allUserTypes;
    } catch (err) {
        console.error("Failed to fetch data from HANA", err);
        req.reject(500, "Failed to fetch data from HANA");
    }
}

async function getAllDepartmentsAndUserTypes() {
    try {
        const deptType = await db.read(Departments).columns("ID", "name", "postalCode");
        const allUserTypes = await db.read(userType);
        return { department: deptType, userType: allUserTypes };
    } catch (err) {
        console.error(err, "Failed to fetch data from HANA");
        throw new Error("Failed to fetch data from HANA");
    }
}

async function getAllVendorsAndAdmins(req) {
    try {
        // Use default fields needed for filtering/searching
        const defaultFields = ["department_name", "AdminType", "UserType", "admin"];
        // Build the query, sort order, and pagination settings from the request
        const { query, sort, pagination } = await buildDynamicQuery(req, defaultFields);
        // Case 1: All keys present – Get Vendors

        if (query.departmentName && query.AdminType && query.UserType) {
            const vendors = await db.read(Vendors)
                .where({ department_name: query.departmentName })
                .orderBy(sort)
                .limit(pagination.top.val, pagination.skip);
            return {
                status: 200,
                message: vendors.length > 0 ? "Success" : "No Vendors found",
                vendors
            };
        }

        // Case 2: Only departmentName and UserType present – Get Admins via helper function
        if (query.departmentName && query.UserType) {
            // Assume GetAdminType is an async function that returns admin details
            const adminResults = await GetAdminType(query.UserType, query.departmentName);
            // Optionally, if needed, you can apply sorting/pagination on adminResults here
            return {
                status: 200,
                message: "Success",
                admin: adminResults
            };
        }

        // Case 3: If 'admin' and 'departmentName' are provided, check for a Power User and return a default admin list.
        if (query.admin && query.departmentName) {
            const powerUserCheck = await db.read(Users)
                .where({ "departments_name": query.departmentName, adminType: "Power User" });
            const adminList = (powerUserCheck && powerUserCheck.length > 0)
                ? ["Quality User", "Corporate Quality User", "Business User", "Store User"]
                : ["Power User", "Quality User", "Corporate Quality User", "Business User", "Store User"];
            return {
                status: 200,
                message: "Success",
                admin: adminList
            };
        }

        // Default case: Return all vendors using the dynamic query (which may include filters from $search, etc.)
        const vendors = await db.read(Vendors)
            .where(query)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        return {
            status: 200,
            message: "Data Found",
            vendors,
            admin: ["Power User", "Quality User", "Corporate Quality User", "Business User", "Store User"]
        };
    } catch (err) {
        console.error("Error fetching vendors and admins:", err);
        return {
            status: 500,
            message: "Error fetching data",
            vendors: [],
            admin: ["Power User", "Quality User", "Corporate Quality User", "Business User", "Store User"]
        };
    }
}

async function getUsersForValueHelp(req) {
    try {
        // 1. Get the current user's email.
        const usermail =
            //req?.user?.id || req?.user?.attr?.email ||
            "qam.dev@agppratham.com";
        console.log("User email:", usermail);

        // 2. Read the current user's record from the "Users" entity.
        const currentUsers = await db.read(Users).where({ isDeleted: false, UserName: usermail });
        if (!currentUsers || currentUsers.length === 0) {
            req.error(404, "User not found");
            return;
        }
        const userRecord = currentUsers[0];

        // 3. Extract the department name (handle both array or object cases)
        const deptName = userRecord.departments_name ? userRecord.departments_name : null;
        // const deptName = Array.isArray(userRecord.departments) && userRecord.departments.length > 0
        //     ? userRecord.departments[0].name
        //     : userRecord.departments && userRecord.departments.name
        //         ? userRecord.departments.name
        //         : null;


        // 4. Build the dynamic query using your helper.
        const defaultFields = ["name"]; // adjust as needed for search/filter fields
        const { query, sort, pagination } = await buildDynamicQuery(req, defaultFields);

        // 5. If the user has a department, add that as an additional filter.
        if (deptName !== null) {
            query["departments.name"] = deptName;
        }

        // 6. Enforce fixed conditions (e.g. type and isDeleted)
        query.type = { in: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
        query.isDeleted = false;


        // departmentRecords = await db.read(Departments).where({ name: { in: departments } });
        // return query;

        // 7. Execute the query with sorting and pagination using CAP/HANA APIs.
        const storeUsers = await db.read(Users)
            .where(query)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        // 8. Retrieve the total count of matching records (for OData compatibility)
        const totalCount = (await db.read(Users).where(query)).length;
        storeUsers["$count"] = totalCount;

        return storeUsers;
    } catch (error) {
        console.error("Error fetching store users:", error.message);
        req.error(500, "Error fetching store users");
    }
}

async function getUsersAndDepartmentsValueHelp(req) {
    try {
        // 1. Retrieve the current user's email
        const usermail =
            //req?.user?.id || req?.user?.attr?.email
            "qam.dev@agppratham.com";
        console.log("User email:", usermail);

        // 2. Read the current user's record from the Users entity in HANA
        const users = await db.read(Users).where({ isDeleted: false, UserName: usermail });

        if (!users || users.length === 0) {
            req.error(404, "User not found");
            return;
        }
        const userRecord = users[0];

        // 3. Extract the department name from the user's departments (supporting array or object)
        const deptName = userRecord.departments_name ? userRecord.departments_name : null;
        // const deptName = Array.isArray(userRecord.departments) && userRecord.departments.length > 0
        //     ? userRecord.departments[0].name
        //     : (userRecord.departments && userRecord.departments.name ? userRecord.departments.name : null);

        // 4. Build a department filter: if a department name exists, use it; otherwise, no filter on name
        const deptFilter = deptName ? { name: deptName } : {};

        // 5. Build the dynamic query (for additional filters, search, sorting, and pagination)
        const defaultFields = ["name", "postalcode"]; // Adjust as needed
        const { query, sort, pagination } = await buildDynamicQuery(req, defaultFields);

        // 6. Merge the department filter with the dynamic query
        const finalQuery = { ...deptFilter, ...query };

        // 7. Execute the query using CAP/HANA syntax.
        let departments = await db.read(Departments)
            .where(finalQuery)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        // 8. Attach the total count (for OData compatibility)
        departments["$count"] = departments.length;
        return departments;
    } catch (error) {
        console.error("Error fetching department value help:", error.message);
        req.error(500, "Error fetching department value help");
    }
}

async function getDepartmentsValueHelp(req) {
    try {
        const documents = await db.read(Departments);
        documents["$count"] = (await db.read(Departments)).length;
        return documents;
    } catch (err) {
        console.error("Error reading documents from HANA", err);
        req.error(500, "Unable to fetch data");
        return [];
    }
}

async function getModifiedDepartmentsValueHelp(req) {
    try {
        const documents = await db.read(Departments);

        const modifiedDocuments = documents.map((doc) => {
            return {
                ...doc,
                departmentId: doc.ID,
            };
        });

        modifiedDocuments["$count"] = modifiedDocuments.length;
        return modifiedDocuments;
    } catch (err) {
        console.error("Error reading documents from HANADB", err);
        req.error(500, "Unable to fetch data");
        return [];
    }
}

async function getAdministratorsValueHelp(req) {
    try {
        // 1. Get current user's email.
        const usermail =
            // req?.user?.id || req?.user?.attr?.email;
            "qam.dev@agppratham.com";
        console.log("User email:", usermail);

        // 2. Retrieve current user's record from the "Users" entity.
        const currentUsers = await db.read(Users).where({ isDeleted: false, UserName: usermail });

        if (!currentUsers || currentUsers.length === 0) {
            req.error(404, "User not found");
            return;
        }
        const userRecord = currentUsers[0];

        // 3. Extract the department name from the user's record.
        // (Assuming your deployed table uses "departments_name" as the field.)
        const deptName = userRecord.departments_name || null;

        // 4. Create a department filter if a department name exists.
        const deptFilter = deptName ? { "departments.name": deptName } : {};

        // 5. Build the base query, sort, and pagination using your helper.
        const { query, sort, pagination } = await buildDynamicQuery(req, ["name"]);

        // 6. Merge the dynamic query with your department filter and fixed conditions.
        const finalQuery = {
            type: { in: [1, 7, 10] },
            isDeleted: false,
            ...query,
            ...deptFilter
        };

        // 7. Execute the query with sorting and pagination.
        const storeUsers = await db.read(Users)
            .where(finalQuery)
            .orderBy(sort)
            .limit(pagination.top.val, pagination.skip);

        // 8. Attach the total count for OData compatibility.
        storeUsers["$count"] = storeUsers.length;
        return storeUsers;
    } catch (error) {
        console.error("Error fetching administrator names:", error.message);
        req.error(500, "Error fetching administrator names");
    }
}

async function getDocumentUploads(req) {
    try {
        // Build dynamic filter from the OData query.
        // The buildDynamicQuery function converts the incoming where clause into a filter object.
        const { query: dynamicQuery, sort, pagination } = await buildDynamicQuery(req, []);

        // Start with a base filter that excludes deleted records.
        let filter = { isDeleted: false, ...dynamicQuery };

        // Custom mapping for department-related filters:
        // - If "allDoc" is present, include only records where departmentName is NULL.
        // - If a department filter is provided, ensure recordId is NULL.
        if (filter.allDoc) {
            filter.departmentName = null; // In CAP's query, null is interpreted as IS NULL.
            delete filter.allDoc;
        } else if (filter.departmentName) {
            filter.recordId = null;
        }

        // Build the REST‑styled CAP query.
        const documentUploads = await db.read(DocumentUploads).where(filter);

        return { data: documentUploads, mainId: "DownloadReports" };
    } catch (err) {
        console.error("Failed to fetch data from HANA", err);
        req.reject(500, "Failed to fetch data from HANA");
    }
}

async function deleteDocumentUploaded(req) {
    // Extract the id from the first parameter's "mainId" property.
    const id = req.params[0].mainId;
    try {
        // Use CAP's fluent query language to update the isDeleted flag.
        await db.update(DocumentUploads)
            .set({ isDeleted: true })
            .where({ ID: id });

        return { data: "Successfully deleted" };
    } catch (err) {
        console.error("Failed to delete DocumentUpload from HANA", err);
        req.reject(500, "Failed to delete DocumentUpload from HANA");
    }
}

async function getAllDownloadTemplates(req) {
    try {
        let { query, sort, pagination } = await buildDynamicQuery(req, []);
        // Read all records from the AssetsExcelSheets entity.
        let records;
        if (pagination?.top && pagination.skip !== undefined) {
            records = await db.read(AssetsExcelSheets).limit(pagination.top.val, pagination.skip);
        }
        // Group records by assetType.
        const groupedRecords = [];
        records.forEach(record => {
            const assetType = record.assetType;
            // Find an existing group.
            let group = groupedRecords.find(g => g.assetType === assetType);
            if (!group) {
                group = { assetType, data: [] };
                groupedRecords.push(group);
            }
            group.data.push(record);
        });

        // Append the count of groups.
        groupedRecords.$count = groupedRecords.length;

        return groupedRecords;
    } catch (err) {
        req.reject(500, "Failed to fetch users" + err.message);
    }
}

async function createDownloadTemplate(req) {
    const startTime = Date.now(); // Start tracking time
    console.log(`[${new Date(startTime).toISOString()}] Request received`);

    try {
        const { id } = req.data;

        // Validate the ID
        if (!id || id.length !== 24) {
            console.error(`[${new Date().toISOString()}] Invalid file ID`);
            return req.error(400, "Invalid file ID provided.");
        }

        console.log(`[${new Date().toISOString()}] Validating file ID: ${id}`);

        // Fetch the file record with only the 'data' field.
        const fileRecords = await db.read(FsChunk)
            .columns(['data'])
            .where({ files_id: id });
        const fileRecord = fileRecords && fileRecords.length > 0 ? fileRecords[0] : null;

        if (!fileRecord) {
            console.error(`[${new Date().toISOString()}] File record not found for ID: ${id}`);
            return req.error(404, "File record not found.");
        }

        console.log(`[${new Date().toISOString()}] File record fetched`);

        // Extract base64 data.
        // If fileRecord.data is stored as binary, it might have a structure similar to {$binary: {base64: ...}}.
        let base64Data = fileRecord.data;
        if (fileRecord.data && fileRecord.data.$binary && fileRecord.data.$binary.base64) {
            base64Data = fileRecord.data.$binary.base64;
        }

        if (!base64Data) {
            console.error(`[${new Date().toISOString()}] Missing base64 data for ID: ${id}`);
            return req.error(500, "Unable to locate base64 encoded data.");
        }

        const responseTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Response prepared in ${responseTime}ms`);

        // Send the response.
        return {
            id: "null",
            data: base64Data,
        };
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
        return req.error(500, "An error occurred while processing the request.");
    }
}

async function getAllContractors(req) {
    try {
        // Use the buildDynamicQuery function to build the query, sort, and pagination
        let { query, sort, pagination } = await buildDynamicQuery(req, []);

        // Enforce the 'isDeleted' filter for all records
        query["isDeleted"] = false;

        // Add additional filters based on the departmentId and type
        if (query["departmentId"]) {
            query["type"] = "Contractor";
            query["departmentId"] = {
                "=": { value: query["departmentId"] }
            };
        }


        // Use db.read() for fetching data
        let vendors;
        if (pagination?.top && pagination?.skip !== undefined) {
            // Pagination and sorting are handled here
            vendors = await db.read(Vendors)
                .where(query)
                .orderBy(sort)
                .limit(pagination.top.val, pagination.skip);
        } else {
            // If no pagination is provided, fetch without limits
            vendors = await db.read(Vendors)
                .where(query)
                .orderBy(sort);
        }

        // Return the vendors (with projection for 'name' and 'shortname' fields)
        return vendors.map(vendor => ({
            name: vendor.name,
            shortname: vendor.shortName
        }));

    } catch (err) {
        console.error("Failed to fetch contractors:", err);
        req.error(500, "Unable to fetch contractors");
    }
}

module.exports = {
    getUserCount, getAllUserType,
    getAllDepartmentsAndUserTypes, getUserAttributes,
    getAllVendorsAndAdmins, getUsersForValueHelp,
    getUsersAndDepartmentsValueHelp, getDepartmentsValueHelp,
    getModifiedDepartmentsValueHelp, getAdministratorsValueHelp,
    getDocumentUploads, deleteDocumentUploaded, getAllDownloadTemplates,
    createDownloadTemplate, getAllContractors
}