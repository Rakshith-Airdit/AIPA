const cds = require("@sap/cds");
const cov2ap = require("@cap-js-community/odata-v2-adapter");
// const fileUpload = require("express-fileupload");

// Register everything inside bootstrap
cds.on("bootstrap", (app) => {
    console.log("✅ BOOTSTRAP is running");

    // OData V2 Adapter
    app.use(cov2ap());

    // File upload middleware
    // app.use(fileUpload({ createParentPath: true }));

    // // Test route
    // app.get('/srv/ping', (req, res) => {
    //     console.log("📩 /srv/ping called");
    //     res.send("pong 🏓");
    // });

    // File upload route
    // app.post('/srv/fileUpload', async (req, res) => {
    //     try {
    //         if (!req.files || !req.files.UploadedFile) {
    //             return res.status(400).send("No file uploaded.");
    //         }

    //         const file = req.files;
    //         console.log("📁 Received file:", file);
    //         res.send({ message: "File received", fileName: file.name });

    //     } catch (err) {
    //         console.error("❌ File upload error:", err);
    //         res.status(500).send("Internal Server Error");
    //     }
    // });
});

module.exports = cds.server;
