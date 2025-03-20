const cds = require("@sap/cds");
const connectDB = require("../lib/db-connect");
const axios = require("axios");
const { Users, Departments, RoleAssignment, userType, Vendors } = cds.entities('Common');

async function buildSearchQuery(req, defaultFields) {
    let query = { isDeleted: false };

    if (req._queryOptions && req._queryOptions.$search) {
        const columns = req.query.SELECT?.columns || [];
        const searchTerm = req._queryOptions.$search || "";  // Use the search term directly from query options
        const searchableFields = columns.map((col) =>
            col.ref ? col.ref[0] : col
        );

        // Add default fields to searchable fields if not already included
        defaultFields.forEach((field) => {
            if (!searchableFields.includes(field)) {
                searchableFields.push(field);
            }
        });

        // Build search conditions using "contains" for HANA text search
        const searchConditions = searchableFields.map((field) => {
            if (field === "departments") {
                // For the 'departments' field, search in 'departments.name'
                return { "departments.name": { contains: searchTerm, ignoreCase: true } };
            }
            return { [field]: { contains: searchTerm, ignoreCase: true } };
        });

        // HANA requires "or" to be specified as `$or` to combine conditions
        query.$or = searchConditions;
    }

    return query;
}


async function sortOrder(req) {
    let sort = {};

    if (req._queryOptions && req._queryOptions.$orderby) {
        const orderby = req._queryOptions.$orderby;
        const fields = orderby.split(",");

        fields.forEach((field) => {
            const [key, direction] = field.trim().split(" ");
            const sortDirection = direction === "desc" ? "desc" : "asc"; // HANA uses 'asc'/'desc' for sorting
            sort[key] = sortDirection;
        });
    }

    return sort;
}

async function sortOrderWithDepart(req) {
    let sort = {};

    // Check if the query options contain the $orderby clause
    if (req._queryOptions && req._queryOptions.$orderby) {
        const orderby = req._queryOptions.$orderby;
        const fields = orderby.split(",");

        // Loop through each field and determine the sorting direction
        fields.forEach((field) => {
            const [key, direction] = field.trim().split(" ");
            const sortDirection = direction === "desc" ? "desc" : "asc"; // Use 'asc' or 'desc' for sorting

            // If the sorting field is 'departmentName', target 'departments.name'
            if (key === "departmentName") {
                sort["departments.name"] = sortDirection;
            } else {
                sort[key] = sortDirection;  // Default behavior for other fields
            }
        });
    }

    return sort;
}


module.exports = async (srv) => {
    const db = await connectDB();
    // const tables = await db.model.definitions;
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

            // Process additional filters from CDS query
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

                    // Regardless of inactivity, count users in each role
                    roleCounts[mappedRole].usercount++;
                    // Add user details to the role's user list
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
                        departmentCounts[deptName].usercount++; // Every user adds to the department's user count
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

            // Prepare combined result for roles
            const roleResults = Object.keys(roleCounts).map((role) => ({
                adminType: role,
                activeCount: roleCounts[role].active,
                inactiveCount: roleCounts[role].inactive,
                usercount: roleCounts[role].usercount, // Correct usercount for each role
                users: roleCounts[role].users, // Include the list of users
            }));

            // Prepare combined result for departments
            const deptResults = Object.keys(departmentCounts).map((dept) => ({
                deptType: dept,
                totalCount: departmentCounts[dept].totalCount,
                usercount: departmentCounts[dept].usercount, // Correct usercount for each department
                users: departmentCounts[dept].users,
            }));

            const result = {
                roles: roleResults,
                departments: deptResults,
                totalRoles: roleResults.length,
                totalDepartments: deptResults.length,
            };

            return { data: result }; // Returning the result
        } catch (error) {
            console.error("Error fetching user counts:", error.message);
            return { error: "Error fetching user counts" };
        }
    });

    srv.on("READ", "UserAttributes", async (req) => {
        const email = req.user.id;
        const userType = req.headers["usertype"];
        console.log(email);
        try {
            if (userType === "ext") {
                const base64Credentials = Buffer.from(
                    `${IDP_USERNAME}:${IDP_PASSWORD}`,
                    "utf-8"
                ).toString("base64");

                const headers = {
                    Authorization: `Basic ${base64Credentials}`,
                };

                let startIndex = 1;
                const count = 100; // Number of items per page
                let userFound = false;
                let matchingUser = null;

                while (!userFound) {
                    const response = await axios.get(`${IDP_ENDPOINT}/scim/Users`, {
                        headers,
                        params: {
                            startIndex,
                            count,
                        },
                    });

                    const users = response.data.Resources || [];
                    matchingUser = users.find((user) => {
                        return user.emails.some((email) => email.value === req.user.id);
                    });

                    if (matchingUser) {
                        userFound = true;
                        break;
                    }

                    const totalResults = response.data.totalResults || 0;
                    if (startIndex + count > totalResults) {
                        break; // No more pages to fetch
                    }

                    startIndex += count; // Move to the next page
                }

                if (!matchingUser) {
                    return req.reject(404, "User not found");
                }

                const customAttributes =
                    matchingUser["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"]
                        ?.attributes || [];
                const departmentAttribute = customAttributes.find(
                    (attr) => attr.name === "customAttribute2"
                );

                const userInDb = await db.read(Users).where({ email: email }).limit(1);
                if (!userInDb || userInDb.length === 0) {
                    return req.reject(404, "User not found in database");
                }
                const user = userInDb[0];

                const departmentName = user.departments
                    ? user.departments[0].name
                    : departmentAttribute
                        ? departmentAttribute.value
                        : null;

                const departmentId = await db.read(Departments).where({ name: departmentName }).limit(1);
                const departmentIdResult = departmentId.length > 0 ? departmentId[0]._id : null;

                await db
                    .update("Users")
                    .set({ lastLoggedInTime: new Date() })
                    .where({ _id: user._id });

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
                const departmentName = user.departments
                    ? user.departments[0].name
                    : departmentAttribute
                        ? departmentAttribute.value
                        : null;

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
            // const userType = await cds.run(SELECT.from('COMMON_USERTYPE'));
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
            const deptType = await db.read(Departments);
            const allUserTypes = await db.read(userType);
            const result = {
                department: deptType,
                userType: allUserTypes,
            };
            return result;
        } catch (err) {
            console.error(err, "Failed to fetch data from HANA");
            throw new Error("Failed to fetch data from HANA");
        }
    });

    srv.on("READ", "Vendors", async (req) => {
        try {
            let query = {};

            if (req.query.SELECT.where) {
                const whereClause = req.query.SELECT.where;
                for (let i = 0; i < whereClause.length; i += 2) {
                    if (whereClause[i].ref && whereClause[i + 1] === "=") {
                        const field = whereClause[i].ref[0];
                        const value = whereClause[i + 2].val;
                        query[field] = value;
                        i++;
                    }
                }
            }

            let defaultFields = ["name", "type", "shortname"];

            let searchQuery = await buildSearchQuery(req, defaultFields);
            query = { ...query, ...searchQuery };

            var sort = await sortOrder(req);
            if (Object.keys(sort).length === 0) {
                sort["name"] = 1;  // Default sorting by 'name' if no sorting provided
            }

            // Handle pagination (skip and top)
            let skip = req._queryOptions && req._queryOptions.$skip ? parseInt(req._queryOptions.$skip) : 0;
            let top = req._queryOptions && req._queryOptions.$top ? parseInt(req._queryOptions.$top) : 100;

            // Query the database using CAP's db.read method
            let documents;
            documents = await db.read(Vendors).where(query).orderBy(sort).limit(top, skip);

            // Count total documents
            const totalCount = await db.read(Vendors).where(query).length;

            // Attach the count to the result
            documents['$count'] = totalCount;

            return documents;
        } catch (error) {
            console.log(error, "Error occurred");
            return req.reject(500, "Error fetching vendors");
        }
    });

    srv.on("READ", "Administrators", async (req) => {
        try {
            let query = { isDeleted: false, type: { in: [1, 7, 10] } };

            // Build search query if $search is provided
            if (req._queryOptions && req._queryOptions.$search) {
                const columns = req.query.SELECT?.columns || [];
                const searchTerm = req._queryOptions.$search || "";
                const searchableFields = columns.map((col) => col.ref ? col.ref[0] : col);
                const defaultFields = ["name", "lastname"];

                // Add default fields to the searchable fields if not present
                defaultFields.forEach((field) => {
                    if (!searchableFields.includes(field)) {
                        searchableFields.push(field);
                    }
                });

                // Create search conditions for each field
                const searchConditions = searchableFields.map((field) => {
                    if (field === "departments") {
                        return { "departments.name": { contains: searchTerm, ignoreCase: true } };
                    }
                    return { [field]: { contains: searchTerm, ignoreCase: true } };
                });

                // Add search conditions to the query
                query.$or = searchConditions;
            }

            // Add additional where conditions from the SELECT clause
            if (req.query.SELECT.where) {
                const whereClause = req.query.SELECT.where;
                for (let i = 0; i < whereClause.length; i++) {
                    if (whereClause[i].ref) {
                        const field = whereClause[i].ref[0];
                        const operator = whereClause[i + 1];
                        const value = whereClause[i + 2].val;
                        if (operator === "=") {
                            query[field] = value;
                        }
                        i += 2;
                    }
                }
            }

            // If departmentName is passed, map it to departments.name
            if (query["departmentName"]) {
                query["departments.name"] = query["departmentName"];
                delete query["departmentName"];
            }

            // Sorting based on user input
            let sort = await sortOrderWithDepart(req);
            if (Object.keys(sort).length === 0) {
                sort["createdDateTime"] = "desc"; // Default sort by createdDateTime in descending order
            }

            // Query the Users table in HANA using CAP's db.read method
            let users;
            if (req._queryOptions && req._queryOptions.$skip && req._queryOptions.$top) {
                let skip = parseInt(req._queryOptions.$skip);
                let top = parseInt(req._queryOptions.$top);
                users = await db.read(Users).where(query).orderBy(sort).limit(top, skip);
            } else {
                users = await db.read(Users).where(query).orderBy(sort);
            }

            // Process the users' departments
            users.forEach((user) => {
                if (user.departments && user.departments.length > 0) {
                    const firstDepartmentname = user.departments[0].name;
                    user.departments = firstDepartmentname; // Only store the name of the first department
                } else {
                    user.departments = null;
                }
            });

            // Log the users for debugging
            users.forEach((user) => {
                console.log(`User: ${user.username}`);
                console.log(`Department Name: ${user.departments}`);
            });

            // Map the results
            const result = users.map((doc) => ({
                ...doc,
                username: doc.username,
            }));

            // Add the total count of matching users
            result["$count"] = await db.read(Users).where(query).length;

            return result;

        } catch (err) {
            console.error("Error fetching administrators data:", err);
            req.reject(500, "Failed to fetch data from HANA");
        }
    });

};