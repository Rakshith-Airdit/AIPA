const cds = require('@sap/cds');
let db = null;

async function connectDB() {
    if (!db) {
        db = await cds.connect.to('db'); // Connect to CAP database service
        // cds.connect.to({ kind: 'hana', credentials: { database: 'my.db' } })
        console.log("✅ Database connected successfully.");
    }
    return db;
}
async function closeDB() {
    if (db && db.disconnect) {
        await db.disconnect();
        console.log("✅ Database connection closed successfully.");
        db = null;
    }
}

function getEntities() {
    return cds.model.entities;
}

module.exports = { connectDB, closeDB };
