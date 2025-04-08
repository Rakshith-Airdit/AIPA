const axios = require('axios');
const { BlobServiceClient, BlockBlobClient, logger } = require("@azure/storage-blob");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "kalaikovanb143@gmail.com",
        pass: "kspl ximk tnha eofv",
    },
});

async function buildDynamicQuery(req, defaultFields = []) {
    // Destructure SELECT parameters
    let { from, columns = [], where = [], orderBy = [], limit = {} } = req.query.SELECT || {};

    // Initialize the query object (remove default isDeleted if not needed)
    const query = {};

    // --- Searching ---
    // If a search term is provided (e.g. via $search query parameter)
    const searchTerm = req.query?.$search;
    if (searchTerm) {
        // Get the list of fields from the columns; if a column is an object, extract the first ref.
        const searchableFields = columns.map(col => (col.ref ? col.ref[0] : col));

        // Add default fields if not already present
        defaultFields.forEach(field => {
            if (!searchableFields.includes(field)) {
                searchableFields.push(field);
            }
        });

        // Build search conditions for each field. Special mapping for "departments"
        const searchConditions = searchableFields.map(field => {
            if (field === "departments") {
                return { "departments.name": { contains: searchTerm, ignoreCase: true } };
            }
            return { [field]: { contains: searchTerm, ignoreCase: true } };
        });

        // In CAP, use "or" (without $) to combine conditions
        query.or = searchConditions;
    }

    // --- Filtering ---
    // Process the where clause (assumes a simple pattern: ref, operator, value)
    if (Array.isArray(where)) {
        for (let i = 0; i < where.length; i++) {
            if (where[i].ref && where[i + 1] === "=" && where[i + 2]) {
                const field = where[i].ref[0];
                const rawValue = where[i + 2];
                const value = rawValue?.val ?? rawValue;
                query[field] = value;
                i += 2; // Skip processed elements
            }
        }
    }

    // --- Sorting ---
    // Build a sort array based on the orderBy clause
    const sort = [];
    if (Array.isArray(orderBy)) {
        orderBy.forEach(order => {
            let field = order.ref ? order.ref[0] : null;
            if (defaultFields.includes(field) || field === "departmentName") {
                const direction = order.sort?.toLowerCase() === "desc" ? "desc" : "asc";
                if (field === "departmentName") {
                    sort.push({ ref: ["departmentName"], sort: direction });
                } else {
                    sort.push({ ref: [field], sort: direction });
                }
            }
        });
    }

    // --- Pagination ---
    // Use the limit clause to determine skip (offset) and top (number of rows)
    const skip = limit.offset || 0;
    const top = limit.rows || 10;

    return { query, sort, pagination: { skip, top } };
}

async function uploadImageToAzure(username, imageurl, imagefilename, connectionString, containerName) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const uniqueFilePath = `${username}_${imagefilename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(uniqueFilePath);

    const buffer = Buffer.from(imageurl, "base64");
    await blockBlobClient.upload(buffer, buffer.length);
    console.log(`Image uploaded to Azure Blob Storage: ${blockBlobClient.url}`);
    return blockBlobClient.url;
}

async function deleteImageFromAzure(blobName, connectionString, containerName) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
        console.log(
            `Deleting blob: ${blobName} from container: ${containerName}`
        );

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();

        console.log(
            `Image deleted from Azure Blob Storage: ${blockBlobClient.url}`
        );
    } catch (error) {
        if (error.statusCode === 404) {
            console.log(`Blob not found: ${blobName}`);
        } else {
            console.error(`Error deleting blob: ${error.message}`);
            throw error;
        }
    }
}

async function checkBtpUserExists(emailID) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
            "858b5457-bbe5-4fff-9b15-400baf0afe64:h:98.ZZl1e[KKCI3ZWfuOOsY26cJebUyCg4"
        ).toString("base64")}`,
    };

    try {
        const response = await axios.get(
            `https://a8emy1lrr.accounts.ondemand.com/service/scim/Users?filter=emails eq "${emailID}"`,
            { headers }
        );

        console.log("Total Results:", response.data.totalResults);
        return response.data.totalResults === 1;
    } catch (error) {
        console.error("Error in checkBtpUserExists:", error.message);
        return false;
    }
}

async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'noreply.qcm@agppratham.com',
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending username to ${to}:`, error);
        throw new Error('Error sending username');
    }
}

function getUserType(AdminType) {
    switch (AdminType) {
        case "Super User":
            return 0;
        case "Power User":
            return 1;
        case "Field User":
            return 2;
        case "Quality User":
            return 7;
        case "Corporate Quality User":
            return 7;
        case "Store User":
            return 8;
        case "Business User":
            return 10;
        default:
            return -1;
    }
}

function isInternalEmail(username) {
    return username.endsWith('@agppratham.com');
}

function isExternalEmail(username) {
    return !username.endsWith('@agppratham.com');
}

function DateFilter(query, params, queryField) {
    if (query[params]) {
        const [startDateEpoch, endDateEpoch] = query[params]
            .split(",")
            .map(Number);
        let startDate = new Date(startDateEpoch);
        startDate.setHours(0, 0, 0, 0);
        let startDateISO = startDate.toISOString();
        let endDate = new Date(endDateEpoch);
        endDate.setHours(23, 59, 59, 999);
        let endDateISO = endDate.toISOString();

        if (!query["$or"]) query["$or"] = [];

        query["$or"].push(
            {
                [queryField]: {
                    $gte: startDateISO,
                    $lte: endDateISO,
                },
            },
            {
                [queryField]: {
                    $gte: new Date(startDateEpoch),
                    $lte: new Date(endDateEpoch),
                },
            }
        );

        console.log(`Query for startingDate:`, query["$or"]);
        delete query[params];
        return query;
    }
}

function handleError(res,error) {
    const status = error.status || 500;
    console.error('Error:', error.message);
    res.status(status).json({
        error: error.message || 'Internal Server Error'
    });
}


module.exports = {
    buildDynamicQuery,
    uploadImageToAzure,
    checkBtpUserExists,
    deleteImageFromAzure,
    getUserType,
    isInternalEmail,
    isExternalEmail,
    sendEmail,
    DateFilter, handleError
}
