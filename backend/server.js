
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const recordsRouter = require("./backend/routes/records");

const app = express();

// Configure permitted frontend origins
const origins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

// Middleware
app.use(cors({
    origin: origins.length > 0 ? origins : true
}));

app.use(express.json());

// API guide
app.get("/", (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Student Event Proposals API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 900px;
                    margin: 40px auto;
                    padding: 20px;
                    line-height: 1.6;
                    background: #f4f6f9;
                    color: #222;
                }
                h1, h2 {
                    color: #12345a;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background: #12345a;
                    color: white;
                }
                pre {
                    background: #e8edf3;
                    padding: 15px;
                    overflow-x: auto;
                }
                a {
                    color: #075bb5;
                }
            </style>
        </head>
        <body>
            <h1>Student Event Proposals API</h1>

            <p>
                This API allows clients to create, read, update
                and delete student event proposals.
            </p>

            <h2>Project Information</h2>
            <p>Course: ICT251 - Web Technologies</p>
            <p>Project: Student Event Proposals</p>
            <p>Database: MySQL</p>
            <p>Student Name: Blessed Chiinga</p>
            <p>Student Number: 202506259</p>

            <h2>API Links</h2>
            <ul>
                <li><a href="/health">Health Check</a></li>
                <li><a href="/api/records">View All Records</a></li>
            </ul>

            <h2>Available Routes</h2>

            <table>
                <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Purpose</th>
                </tr>
                <tr>
                    <td>GET</td>
                    <td>/</td>
                    <td>API guide</td>
                </tr>
                <tr>
                    <td>GET</td>
                    <td>/health</td>
                    <td>Check server and database</td>
                </tr>
                <tr>
                    <td>GET</td>
                    <td>/api/records</td>
                    <td>Get all records</td>
                </tr>
                <tr>
                    <td>GET</td>
                    <td>/api/records/:id</td>
                    <td>Get one record</td>
                </tr>
                <tr>
                    <td>POST</td>
                    <td>/api/records</td>
                    <td>Create a record</td>
                </tr>
                <tr>
                    <td>PUT</td>
                    <td>/api/records/:id</td>
                    <td>Update a record</td>
                </tr>
                <tr>
                    <td>DELETE</td>
                    <td>/api/records/:id</td>
                    <td>Delete a record</td>
                </tr>
            </table>

            <h2>Record Fields</h2>
            <ul>
                <li>title: 3 to 80 characters</li>
                <li>category: 2 to 40 characters</li>
                <li>description: 5 to 300 characters</li>
                <li>status: Pending, In progress, or Completed</li>
            </ul>

            <h2>Example POST and PUT JSON Body</h2>
            <pre>{
    "title": "Annual Cultural Day",
    "category": "Cultural",
    "description": "An event celebrating different cultures.",
    "status": "Pending"
}</pre>

            <h2>Response Codes</h2>
            <ul>
                <li>200 - Successful GET, PUT or DELETE</li>
                <li>201 - Record created</li>
                <li>400 - Invalid input or malformed JSON</li>
                <li>404 - Record or route not found</li>
                <li>500 - Unexpected server error</li>
                <li>503 - Database unavailable during health check</li>
            </ul>

            <p>
                Note: If the hosted service has been idle,
                its first request may take some time to respond.
            </p>
        </body>
        </html>
    `);
});

// Health check: test MySQL connection
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            message: "Server and MySQL database are healthy."
        });
    } catch (error) {
        console.error("Database health check failed:", error);

        res.status(503).json({
            status: "ERROR",
            message: "MySQL database connection failed."
        });
    }
});

// Mount records routes
app.use("/api/records", recordsRouter);

// Unknown route handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Error handler
app.use((err, req, res, next) => {
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            message: "Invalid JSON format."
        });
    }

    console.error("Server error:", err);

    res.status(500).json({
        message: "Internal server error."
    });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
});
