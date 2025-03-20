const cds = require("@sap/cds");
const connectDB = require("../lib/db-connect");
const { filter } = require("hdb/lib/util");
const { Users, Departments } = cds.entities('Common');


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


};