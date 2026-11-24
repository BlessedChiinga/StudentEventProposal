
import { API_BASE_URL } from "./config.js";

// Send requests to the backend API
async function request(path, method = "GET", body) {
    const options = { method };

    if (body !== undefined) {
        options.headers = {
            "Content-Type": "application/json"
        };

        options.body = JSON.stringify(body);
    }

    const response = await fetch(
        API_BASE_URL + path,
        options
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "The request failed."
        );
    }

    return data;
}

// Send only editable record fields
function editableFields(record) {
    return {
        title: record.title,
        category: record.category,
        description: record.description,
        status: record.status
    };
}

// Record service
export const recordService = {

    // GET all records
    list() {
        return request("/api/records");
    },

    // GET a single record
    get(id) {
        return request(`/api/records/${id}`);
    },

    // POST a new record
    create(record) {
        return request(
            "/api/records",
            "POST",
            editableFields(record)
        );
    },

    // PUT an existing record
    update(id, record) {
        return request(
            `/api/records/${id}`,
            "PUT",
            editableFields(record)
        );
    },

    // DELETE a record
    remove(id) {
        return request(
            `/api/records/${id}`,
            "DELETE"
        );
    }
};
