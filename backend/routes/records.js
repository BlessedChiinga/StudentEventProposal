
const express = require("express");
const router = express.Router();
const pool = require("../../db");

const allowedStatuses = [
    "Pending",
    "In progress",
    "Completed"
];

// Validate proposal information
function validateRecord(req, res, next) {
    const { title, category, description, status } = req.body || {};

    // Validate title
    if (
        typeof title !== "string" ||
        title.trim().length < 3 ||
        title.trim().length > 80
    ) {
        return res.status(400).json({
            message: "Title must have 3 to 80 characters."
        });
    }

    // Validate category
    if (
        typeof category !== "string" ||
        category.trim().length < 2 ||
        category.trim().length > 40
    ) {
        return res.status(400).json({
            message: "Category must have 2 to 40 characters."
        });
    }

    // Validate description
    if (
        typeof description !== "string" ||
        description.trim().length < 5 ||
        description.trim().length > 300
    ) {
        return res.status(400).json({
            message: "Description must have 5 to 300 characters."
        });
    }

    // Validate status
    if (
        typeof status !== "string" ||
        !allowedStatuses.includes(status)
    ) {
        return res.status(400).json({
            message: "Status must be Pending, In progress, or Completed."
        });
    }

    req.record = {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        status
    };

    next();
}

// Validate record ID
function validateId(req, res, next) {
    const id = req.params.id;

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            message: "ID must be a positive whole number."
        });
    }

    const numberId = Number(id);

    if (!Number.isSafeInteger(numberId)) {
        return res.status(400).json({
            message: "ID is outside the allowed range."
        });
    }

    req.recordId = numberId;
    next();
}

// GET all records
router.get("/", async (req, res, next) => {
    try {
        const [rows] = await pool.execute(
            "SELECT id, title, category, description, status FROM records ORDER BY id ASC"
        );

        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
});

// GET one record
router.get("/:id", validateId, async (req, res, next) => {
    try {
        const [rows] = await pool.execute(
            "SELECT id, title, category, description, status FROM records WHERE id = ?",
            [req.recordId]
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

// POST create a record
router.post("/", validateRecord, async (req, res, next) => {
    try {
        const { title, category, description, status } = req.record;

        const [result] = await pool.execute(
            `INSERT INTO records
            (title, category, description, status)
            VALUES (?, ?, ?, ?)`,
            [title, category, description, status]
        );

        const [rows] = await pool.execute(
            "SELECT id, title, category, description, status FROM records WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// PUT update a record
router.put("/:id", validateId, validateRecord, async (req, res, next) => {
    try {
        const { title, category, description, status } = req.record;

        const [result] = await pool.execute(
            `UPDATE records
            SET title = ?, category = ?, description = ?, status = ?
            WHERE id = ?`,
            [title, category, description, status, req.recordId]
        );

        if (result.affectedRows === 0) {
            const [rows] = await pool.execute(
                "SELECT id FROM records WHERE id = ?",
                [req.recordId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Record not found."
                });
            }
        }

        const [rows] = await pool.execute(
            "SELECT id, title, category, description, status FROM records WHERE id = ?",
            [req.recordId]
        );

        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE a record
router.delete("/:id", validateId, async (req, res, next) => {
    try {
        const [result] = await pool.execute(
            "DELETE FROM records WHERE id = ?",
            [req.recordId]
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
