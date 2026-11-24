
// =============================================
// STUDENT EVENT PROPOSALS MANAGEMENT SYSTEM
// ICT251 - ACTIVITY 7
// REST API ROUTES
// =============================================

const express = require("express");
const pool = require("../db");

const router = express.Router();

const allowedStatuses = [
    "Pending",
    "In progress",
    "Completed"
];

// Validate record ID
function validId(id) {
    return /^\d+$/.test(id) &&
        Number.isSafeInteger(Number(id)) &&
        Number(id) > 0 &&
        Number(id) <= 4294967295;
}

// Validate request body
function validateRecord(body) {

    if (!body || typeof body !== "object" ||
        Array.isArray(body)) {
        return "A valid JSON object is required.";
    }

    const { title, category, description, status } = body;

    if (typeof title !== "string" ||
        title.trim().length < 3 ||
        title.trim().length > 80) {
        return "Title must contain 3 to 80 characters.";
    }

    if (typeof category !== "string" ||
        category.trim().length < 2 ||
        category.trim().length > 40) {
        return "Category must contain 2 to 40 characters.";
    }

    if (typeof description !== "string" ||
        description.trim().length < 5 ||
        description.trim().length > 300) {
        return "Description must contain 5 to 300 characters.";
    }

    if (!allowedStatuses.includes(status)) {
        return "Status must be Pending, In progress or Completed.";
    }

    return null;
}


// =============================================
// GET ALL RECORDS
// =============================================

router.get("/", async (req, res, next) => {

    try {

        const [rows] = await pool.execute(
            "SELECT * FROM records ORDER BY id"
        );

        res.status(200).json(rows);

    } catch (error) {
        next(error);
    }

});


// =============================================
// GET ONE RECORD
// =============================================

router.get("/:id", async (req, res, next) => {

    try {

        if (!validId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const [rows] = await pool.execute(
            "SELECT * FROM records WHERE id = ?",
            [Number(req.params.id)]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        next(error);
    }

});


// =============================================
// POST - CREATE A RECORD
// =============================================

router.post("/", async (req, res, next) => {

    try {

        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const title = req.body.title.trim();
        const category = req.body.category.trim();
        const description = req.body.description.trim();
        const status = req.body.status;

        const [result] = await pool.execute(
            `INSERT INTO records
             (title, category, description, status)
             VALUES (?, ?, ?, ?)`,
            [title, category, description, status]
        );

        res.status(201).json({
            id: result.insertId,
            title,
            category,
            description,
            status
        });

    } catch (error) {
        next(error);
    }

});


// =============================================
// PUT - UPDATE A RECORD
// =============================================

router.put("/:id", async (req, res, next) => {

    try {

        if (!validId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const id = Number(req.params.id);

        const title = req.body.title.trim();
        const category = req.body.category.trim();
        const description = req.body.description.trim();
        const status = req.body.status;

        const [result] = await pool.execute(
            `UPDATE records
             SET title = ?,
                 category = ?,
                 description = ?,
                 status = ?
             WHERE id = ?`,
            [title, category, description, status, id]
        );

        if (result.affectedRows === 0) {

            const [existing] = await pool.execute(
                "SELECT id FROM records WHERE id = ?",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Record not found."
                });
            }
        }

        res.status(200).json({
            id,
            title,
            category,
            description,
            status
        });

    } catch (error) {
        next(error);
    }

});


// =============================================
// DELETE A RECORD
// =============================================

router.delete("/:id", async (req, res, next) => {

    try {

        if (!validId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const [result] = await pool.execute(
            "DELETE FROM records WHERE id = ?",
            [Number(req.params.id)]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });

    } catch (error) {
        next(error);
    }

});

module.exports = router;
