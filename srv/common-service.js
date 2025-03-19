const cds = require("@sap/cds");
const hana = require('');

module.exports = async (srv) => {
    const { Users, Departments } = srv.entities;

    srv.on("READ", "UserCount", async (req) => {
        try {

            return { data: Departments };
        } catch (error) {
            console.log(error);
        }
    });
};