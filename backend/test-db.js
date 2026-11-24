
const pool = require("./db");

async function testDatabase() {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM records ORDER BY id"
        );

        console.log("MySQL connected successfully!");
        console.table(rows);
        console.log("Total records:", rows.length);

    } catch (error) {
        console.error("Database connection failed:");
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

testDatabase();
