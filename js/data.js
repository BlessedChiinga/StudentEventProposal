
import { API_BASE_URL } from "./config.js";

// Send requests to the backend API.
async function request(path, method = "GET", body) {
    const options = {
        method,
        headers: {
            "Accept": "application/json"
        }
    };

    if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE_URL + path, options);

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(data.message || "The request failed.");
    }

    return data;
}

// Methods used by the frontend.
export const recordService = {

    // GET all proposals
    async list() {
        const records = await request("/api/records");

        if (!Array.isArray(records)) {
            throw new Error("The server returned an invalid records list.");
        }

        return records;
    },

    // GET one proposal
    async get(id) {
        return request(`/api/records/${id}`);
    },

    // POST a new proposal
    async create(record) {
        return request("/api/records", "POST", record);
    },

    // PUT an existing proposal
    async update(id, record) {
        return request(`/api/records/${id}`, "PUT", record);
    },

    // DELETE a proposal
    async remove(id) {
        return request(`/api/records/${id}`, "DELETE");
    }

};
