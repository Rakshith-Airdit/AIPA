// async function buildSearchQuery(req, defaultFields) {
//     let query = { isDeleted: false };

//     const searchTerm = req.query?.$search;
//     if (searchTerm) {
//         const columns = req.query.SELECT?.columns || [];
//         const searchableFields = columns.map((col) =>
//             col.ref ? col.ref[0] : col
//         );

//         // Add default fields if not included
//         defaultFields.forEach((field) => {
//             if (!searchableFields.includes(field)) {
//                 searchableFields.push(field);
//             }
//         });

//         // Build search condition
//         const searchConditions = searchableFields.map((field) => {
//             if (field === "departments") {
//                 return { "departments.name": { contains: searchTerm, ignoreCase: true } };
//             }
//             return { [field]: { contains: searchTerm, ignoreCase: true } };
//         });

//         query.$or = searchConditions;
//     }

//     return query;
// }

// async function sortOrder(req) {
//     const sort = [];

//     const orderBy = req.query?.SELECT?.orderBy;
//     if (orderBy && Array.isArray(orderBy)) {
//         orderBy.forEach((order) => {
//             const field = order.ref?.[0];
//             const direction = order.sort?.toLowerCase() === "desc" ? "desc" : "asc";
//             sort.push({ ref: [field], sort: direction });
//         });
//     }

//     return sort;
// }

// async function sortOrderWithDepart(req) {
//     const sort = [];

//     const orderBy = req.query?.SELECT?.orderBy;

//     if (orderBy && Array.isArray(orderBy)) {
//         console.log(orderBy);
//         orderBy.forEach((order) => {
//             let field = order.ref?.[0];
//             const direction = order.sort?.toLowerCase() === "desc" ? "desc" : "asc";

//             // Map departmentName to departments.name
//             if (field === "departmentName") {
//                 sort.push({ ref: ["departments", "name"], sort: direction });
//             } else {
//                 sort.push({ ref: [field], sort: direction });
//             }
//         });
//     }

//     return sort;
// }

const { BlobServiceClient, BlockBlobClient, logger } = require("@azure/storage-blob");

async function buildDynamicQuery(req, defaultFields = []) {
    // Destructure SELECT parameters
    let { from, columns = [], where = [], orderBy = [], limit = {} } = req.query.SELECT || {};

    // Initialize the query object
    const query = { isDeleted: false };

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

        // Merge search conditions into query using $or
        query.$or = searchConditions;
    }

    // --- Filtering ---
    // Process the where clause (assumes a simple pattern: ref, operator, value)
    if (Array.isArray(where)) {
        for (let i = 0; i < where.length; i++) {
            // Check for a condition with a reference, an equals operator, and a value
            if (where[i].ref && where[i + 1] === "=" && where[i + 2]) {
                const field = where[i].ref[0];
                const rawValue = where[i + 2];
                // Use .val if available, otherwise use the raw value
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
            // Only include if the field is in your allowed/default fields
            if (defaultFields.includes(field) || field === "departmentName") {
                const direction = order.sort?.toLowerCase() === "desc" ? "desc" : "asc";
                if (field === "departmentName") {
                    sort.push({ ref: ["departments", "name"], sort: direction });
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

const fileUploadHandler = async (req) => {
    if (!req._.req?.files || !req._.req.files.UploadedFile) {
        throw new Error("No file uploaded.");
    }

    const file = req._.req.files.UploadedFile;

    console.log("📁 File received:", file.name);

    return {
        fileName: file.name,
        buffer: file.data,
        size: file.size,
        mimeType: file.mimetype
    };
};

module.exports = {
    // buildSearchQuery,
    // sortOrder,
    // sortOrderWithDepart,
    buildDynamicQuery,
    uploadImageToAzure, fileUploadHandler, deleteImageFromAzure
}