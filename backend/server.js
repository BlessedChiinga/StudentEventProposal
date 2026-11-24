
// =============================================
// STUDENT EVENT PROPOSALS MANAGEMENT SYSTEM
// ICT251 - ACTIVITY 7
// EXPRESS BACKEND SERVER
// =============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const recordsRouter = require("./routes/records");

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);


// =============================================
// MIDDLEWARE
// =============================================

app.use(cors({
    origin: function (origin, callback) {

        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, false);
    }
}));

app.use(express.json());


// =============================================
// API DOCUMENTATION HOMEPAGE
// =============================================

app.get("/", (req, res) => {

    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0">

            <title>Student Event Proposals API</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    background: #f1f5f9;
                    color: #1e293b;
                    margin: 0;
                    padding: 30px;
                    line-height: 1.6;
                }

                .container {
                    max-width: 1000px;
                    margin: auto;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                }

                h1, h2 {
                    color: #1e3a8a;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    border: 1px solid #cbd5e1;
                    padding: 12px;
                    text-align: left;
                }

                th {
                    background: #1e3a8a;
                    color: white;
                }

                pre {
                    background: #0f172a;
                    color: #e2e8f0;
                    padding: 20px;
                    border-radius: 8px;
                    overflow-x: auto;
                }

                a {
                    color: #2563eb;
                }

            </style>

        </head>

        <body>

            <div class="container">

                <h1>Student Event Proposals Management System</h1>

                <p><strong>Mulungushi University</strong></p>

                <p>ICT251 - Activity 7 Backend Development</p>

                <p>Student Number: 202506259</p>

                <p>
                    This REST API manages student event proposals
                    using Node.js, Express and MySQL.
                </p>

                <h2>API Base URL</h2>

                <p id="base-url"></p>

                <script>
                    document.getElementById("base-url")
                        .textContent = window.location.origin;
                </script>

                <h2>Quick Links</h2>

                <ul>
                    <li>
                        <a href="/api/health">API Health Check</a>
                    </li>

                    <li>
                        <a href="/api/records">View All Records</a>
                    </li>

                    <li>
                        <a href="/api/records/1">View Record 1</a>
                    </li>
                </ul>

                <h2>API Endpoints</h2>

                <table>

                    <tr>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Description</th>
                    </tr>

                    <tr>
                        <td>GET</td>
                        <td>/api/health</td>
                        <td>Check database connectivity</td>
                    </tr>

                    <tr>
                        <td>GET</td>
                        <td>/api/records</td>
                        <td>Retrieve all proposals</td>
                    </tr>

                    <tr>
                        <td>GET</td>
                        <td>/api/records/:id</td>
                        <td>Retrieve one proposal</td>
                    </tr>

                    <tr>
                        <td>POST</td>
                        <td>/api/records</td>
                        <td>Create a proposal</td>
                    </tr>

                    <tr>
                        <td>PUT</td>
                        <td>/api/records/:id</td>
                        <td>Update a proposal</td>
                    </tr>

                    <tr>
                        <td>DELETE</td>
                        <td>/api/records/:id</td>
                        <td>Delete a proposal</td>
                    </tr>

                </table>

                <h2>Record Fields</h2>

                <ul>
                    <li>id: Automatically generated integer</li>
                    <li>title: 3 to 80 characters</li>
                    <li>category: 2 to 40 characters</li>
                    <li>description: 5 to 300 characters</li>
                    <li>status: Pending, In progress or Completed</li>
                </ul>

                <h2>Example POST and PUT Request Body</h2>

                <pre>{
    "title": "Cyber Security Awareness Workshop",
    "category": "Academic",
    "description": "A workshop on online safety and cyber security.",
    "status": "Pending"
}</pre>

                <h2>HTTP Status Codes</h2>

                <ul>
                    <li>200 - Successful request</li>
                    <li>201 - Record created</li>
                    <li>400 - Invalid request</li>
                    <li>404 - Record or route not found</li>
                    <li>500 - Internal server error</li>
                    <li>503 - Database unavailable</li>
                </ul>

                <p>
                    Note: If the hosted service has been idle,
                    it may take some time to start.
                </p>

            </div>

        </body>

        </html>
    `);

});


// =============================================
// HEALTH CHECK
// =============================================

app.get("/api/health", async (req, res) => {

    try {

        await pool.execute("SELECT 1");

        res.status(200).json({
            status: "ok",
            database: "connected"
        });

    } catch (error) {

        console.error("Health check failed:", error.message);

        res.status(503).json({
            message: "Database unavailable."
        });

    }

});


// =============================================
// RECORDS ROUTES
// =============================================

app.use("/api/records", recordsRouter);


// =============================================
// UNKNOWN ROUTE HANDLER
// =============================================

app.use((req, res) => {

    res.status(404).json({
        message: "Route not found."
    });

});


// =============================================
// GLOBAL ERROR HANDLER
// =============================================

app.use((error, req, res, next) => {

    if (error.type === "entity.parse.failed") {

        return res.status(400).json({
            message: "Invalid JSON request body."
        });

    }

    console.error(error.message);

    res.status(500).json({
        message: "Internal server error."
    });

});


// =============================================
// START SERVER
// =============================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("======================================");
    console.log("Student Event Proposals API");
    console.log(`Server running on port ${PORT}`);
    console.log(`Local URL: http://localhost:${PORT}`);
    console.log("======================================");

});
