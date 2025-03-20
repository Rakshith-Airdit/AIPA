const cds = require('@sap/cds');
let db = null;

async function connectDB() {
    if (!db) {
        db = await cds.connect.to('db'); // Connect to CAP database service
        console.log("✅ Database connected successfully.");
    }
    return db;
}

module.exports = connectDB;
