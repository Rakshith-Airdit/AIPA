const { connectDB } = require("../lib/db-connect");
const { Users, Departments,
    RoleAssignment, userType,
    Vendors, ActivityLogs,
    AssetNetworks, DeviceManagement, Forms,
    FieldDetails, VersionManagement, FormCollection,
    RedFlagRules, DocumentUploads, AssetsExcelSheets,
    FsChunk, Projects } = cds.entities('Common');
const { IDP_USERNAME, IDP_PASSWORD, IDP_ENDPOINT, AZURE_CONNECTION_STRING: connectionString, AZURE_CONTAINER_NAME: containerName } = process.env;
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


async function getAllProjects(req) {
    try {
        // Build dynamic query, sort, and pagination using your helper function
        let { query, sort, pagination } = await buildDynamicQuery(req, []);

        // Apply default isDeleted filter
        query.isDeleted = false;

        // Process search query if available
        if (req.query.$search) {
            const searchTerm = req.query.$search;
            const searchableFields = ['departmentName', 'name', 'equipmentType', 'contractorno', 'pmcno', 'clientno'];

            const searchConditions = searchableFields.map((field) => {
                if (field === 'contractorno' || field === 'pmcno' || field === 'clientno') {
                    return { [`${field}.name`]: { contains: searchTerm, ignoreCase: true } };
                }
                return { [field]: { contains: searchTerm, ignoreCase: true } };
            });

            // Combine the dynamic search conditions into the query
            query.or = searchConditions;
        }

        // Handle additional filters from the WHERE clause in the OData query
        if (req.query.SELECT.where) {
            req.query.SELECT.where.forEach(condition => {
                if (condition.ref) {
                    const field = condition.ref[0];
                    const operator = condition[1];
                    const value = condition[2].val;

                    if (operator === "=") {
                        query[field] = value;
                    }
                }
            });
        }

        // Handle date range filters (startingDate, endingDate)
        if (query.startingDate) {
            const [startDateEpoch, endDateEpoch] = query.startingDate.split(',').map(Number);
            const startDate = new Date(startDateEpoch).setHours(0, 0, 0, 0);
            const endDate = new Date(endDateEpoch).setHours(23, 59, 59, 999);

            query.startDate = { '>=': startDate, '<=': endDate };
            delete query.startingDate; // Clean up the temporary filter field
        }

        if (query.endingDate) {
            const [startDateEpoch, endDateEpoch] = query.endingDate.split(',').map(Number);
            const startDate = new Date(startDateEpoch).setHours(0, 0, 0, 0);
            const endDate = new Date(endDateEpoch).setHours(23, 59, 59, 999);

            query.endDate = { '>=': startDate, '<=': endDate };
            delete query.endingDate; // Clean up the temporary filter field
        }

        // Default sort by createdTimestamp if no sorting is provided
        if (Object.keys(sort).length === 0) {
            sort = { createdTimeStamp: 'desc' };
        }

        // Get the user details
        const userEmail =
            //req?.user?.id || req?.user?.attr?.email
            "qam.dev@agppratham.com";
        if (!userEmail) {
            req.error(500, "User email is missing");
        }
        const user = await db.read(Users).where({ UserName: userEmail });
        if (!user || user.length === 0) {
            req.error(500, "User not found");
        }

        // Apply user-specific filters (if required, such as admin type, department, etc.)
        let userFilter = {};
        if (user.adminType === "Field User" || user.type === 2) {
            const userName = user[0].UserName;
            const departmentName = user[0].departments[0].name;
            userFilter = {
                users: { $elemMatch: { UserName: userName } },
                departmentName: departmentName,
                ...query,
            };
        } else {
            userFilter = query;
        }

        // Handle pagination and read records from the HANA database using db.read()
        let result;
        if (pagination.top && pagination.skip !== undefined) {
            const skip = parseInt(pagination.skip);
            const top = parseInt(pagination.top);
            result = await db.read(Projects)
                .where(userFilter)
                .orderBy(sort)
                .limit(top, skip);
        } else {
            result = await db.read(Projects)
                .where(userFilter)
                .orderBy(sort);
        }

        // Count the total number of records matching the query
        const totalCount = (await db.read(Projects)
            .where(userFilter)).length;

        // Append the total count to the response
        result.$count = totalCount;

        return result;
    } catch (err) {
        console.error("Error reading projects:", err);
        req.error(500, "Unable to fetch data");
    }
}

async function createProject(req) {
    try {
        const { clientNo, contractorNo, pmcNo, departmentName, ...data } = req.data;
        let departmentId;
        if (departmentName) {
            // Look up the department using HANA REST–styled query
            const departments = await db.read(Departments).where({ name: departmentName });
            if (departments && departments.length > 0) {
                // Assuming the primary key field is "ID" (or use _id if applicable)
                departmentId = departments[0].ID || departments[0]._id;
            } else {
                console.warn(`Department with name ${departmentName} not found`);
                req.reject(`Department with name ${departmentName} not found`);
            }
        }

        const projectData = {
            ID: cds.utils.uuid(),
            department_ID: departmentId,
            department_Name: departmentName,
            steel_bend: 0,
            steel_cap: 0,
            steel_valve: 0,
            steel_elbow: 0,
            steel_reducer: 0,
            steel_tee: 0,
            steel_pipe: 0,
            mdpe_serviceRegulator: 0,
            mdpe_transitionFitting: 0,
            mdpe_tee: 0,
            mdpe_saddle: 0,
            mdpe_reducer: 0,
            mdpe_pipe: 0,
            mdpe_peValve: 0,
            mdpe_mrs: 0,
            mdpe_marker: 0,
            mdpe_endCap: 0,
            mdpe_drs: 0,
            mdpe_coupler: 0,
            mdpe_commercialMeters: 0,
            mdpe_coil: 0,
            mdpe_elbow: 0,
            estimatedStartDate: req.data.startDate,
            estimatedEndDate: req.data.endDate,
            reportUpdates: false,
            sequenceId: null,
            geoJSON: {},
            chainageFrom: null,
            chainageTo: null,
            workInstruction: null,
            isAllowMap: false,
            assigned: [],
            assignedGroupAdmin: [],
            assignedForms: [],
            assignedUsers: [],
            statusOfTheTask: null,
            workFlowStatus: null,
            workFlowAssignedBy: {},
            workFlowName: null,
            workFlowAssignedTo: null,
            workAssignmentLevel: 0,
            isReassign: false,
            Date: new Date().toISOString(),
            Comments: null,
            formzCategory: [],
            isPrepopAttached: false,
            pmcNo: pmcNo ? pmcNo : null,
            taskType: false,
            users_ID: null,
            lastDataReqTime: null,
            isDeleted: false,
            isClosed: false,
            isAllowedMap: false,
            popNumber: "",
            type: req.data.equipmentType[0],
            createdTimeStamp: new Date().toISOString(),
            projectID_ID: null,
            update: {},
            updateProject: {},
            clientNo: clientNo ? [{ name: clientNo }] : [],
            contractorNo: contractorNo ? [{ name: contractorNo }] : [],
            type: Array.isArray(data.equipmentType) ? data.equipmentType[0] : (data.equipmentType || "Steel"),
            createdBy: "",
            createdByMailID: "",
            name: req.data.name ? req.data.name : ""
        };


        // const projectExists = await db.read(Projects).where({ or: [{ name: data.name }, { shortName: data.shortname }] });
        // const projectExists = db.read(Projects).where([
        //     { name: data.name },
        //     { shortName: data.shortname }
        // ]);

        const projectExists = await db.read(Projects).where({
            name: data.name,
        }).or({
            shortName: data.shortname
        });
        // Check for duplicate project based on name or shortname using HANA REST–styled query

        if (projectExists && projectExists.length > 0) {
            let errorMessage = "Duplicate record found:";
            if (projectExists[0].name === data.name) {
                errorMessage += ` Project Name '${data.name}' already exists.`;
            }
            if (projectExists[0].shortname === data.shortname) {
                errorMessage += ` Short Name '${data.shortname}' already exists.`;
            }
            return req.error(400, errorMessage);
        }

        // Insert the project record using HANA REST–styled insert query
        const result = await db.create(Projects).entries(projectData);
        // const result = await db.insert(projectData).into(Projects);

        // If the insert returns an identifier, update the record with projectID
        if (result && result.ID) {
            await db.update(Projects)
                .set({ projectID_ID: result.ID })
                .where({ ID: result.ID });
        }
        console.log(`Inserted in HANA DB with ID: ${result.ID}`);
        return projectData;
    } catch (err) {
        console.error("Error creating project in HANA DB", err.message);
        req.error(500, "Unable to create project " + err);
        return [];
    }
}

async function getDetailedProjectInsights(req) {
    try {
        // Build dynamic query, sort, and pagination using the helper function
        let { query, sort, pagination } = await buildDynamicQuery(req, []);

        // Apply default isDeleted filter
        query.isDeleted = false;

        // if (Array.isArray(sort)) {
        //     sort.forEach((item, index) => {
        //         if (item.ref && item.ref.includes("departments")) {
        //             // Delete the departments field within that specific object
        //             delete sort[index];
        //         }
        //     });

        //     // Optionally, you may want to clean up the array by removing undefined values
        //     sort = sort.filter(item => item !== undefined);
        // }

        // Use CAP db.read() instead of MongoDB client
        let projects;
        if (pagination?.top && pagination.skip !== undefined) {
            const skip = parseInt(pagination.skip, 10);
            const top = parseInt(pagination.top.val, 10);
            projects = await db.read(Projects).where(query).orderBy(sort).limit(top, skip);
        } else {
            projects = await db.read(Projects).where(query).orderBy(sort);
        }

        // Current date for delay calculations
        const today = new Date();
        // Aggregation logic for department-wise insights
        const aggregatedResults = projects.reduce((accumulator, project) => {
            const departmentName = project.department_name;
            const endDate = new Date(project.endDate);
            const estimatedEndDate = new Date(project.estimatedEndDate);

            // Calculate delay in months
            const delayInMonths = (endDate - estimatedEndDate) / (1000 * 60 * 60 * 24 * 30);

            if (!accumulator[departmentName]) {
                accumulator[departmentName] = {
                    department_name: departmentName,
                    completed: 0,
                    inprogress: 0,
                    totalCount: 0,
                    projectsDelayed: 0,
                    delay0To3: 0,
                    delay3To6: 0,
                    delay6To12: 0,
                    delay12Plus: 0,
                };
            }

            accumulator[departmentName].totalCount++;

            if (endDate <= today) {
                accumulator[departmentName].completed++;
            } else {
                accumulator[departmentName].inprogress++;
            }

            if (estimatedEndDate < endDate) {
                accumulator[departmentName].projectsDelayed++;

                if (delayInMonths <= 3) {
                    accumulator[departmentName].delay0To3++;
                } else if (delayInMonths <= 6) {
                    accumulator[departmentName].delay3To6++;
                } else if (delayInMonths <= 12) {
                    accumulator[departmentName].delay6To12++;
                } else {
                    accumulator[departmentName].delay12Plus++;
                }
            }

            return accumulator;
        }, {});

        // Convert the aggregated results to an array
        const deptInsights = Object.values(aggregatedResults).map(department => ({
            department_name: department.department_name,
            completed: department.completed,
            inprogress: department.inprogress,
            totalCount: department.totalCount,
            averageCompletion: ((department.completed / department.totalCount) * 100).toFixed(2),
            percentInDelay: ((department.projectsDelayed / department.totalCount) * 100).toFixed(2),
            delay0To3: department.delay0To3,
            delay3To6: department.delay3To6,
            delay6To12: department.delay6To12,
            delay12Plus: department.delay12Plus,
        }));

        // Project-wise delay calculation
        const projectWiseDelay = projects.map((project) => {
            const projectName = project.shortname;
            const endDate = new Date(project.endDate);
            const estimatedEndDate = new Date(project.estimatedEndDate);

            const delayInDays = Math.round((endDate - estimatedEndDate) / (1000 * 60 * 60 * 24));

            return {
                projectName,
                delayInDays,
            };
        });

        // Return the aggregated insights and project-wise delay data
        return { deptInsights, projectWiseDelay };
    } catch (error) {
        console.error("Error occurred:", error);
        req.error(500, "An error occurred while processing the request.");
    }
}

module.exports = {
    getAllProjects,
    createProject,
    getDetailedProjectInsights
}