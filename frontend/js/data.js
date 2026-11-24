
// ==========================================
// STUDENT EVENT PROPOSALS
// DATA SERVICE
// ==========================================


// 1. LOCAL STORAGE KEY

const STORAGE_KEY = "student-event-proposals-demo-v1";


// 2. EIGHT STARTING PROPOSALS

const startingRecords = [

    {
        id: 1,
        title: "Annual Campus Innovation Fair",
        category: "Academic",
        description: "A fair where students demonstrate creative projects, prototypes and new ideas.",
        status: "Pending"
    },

    {
        id: 2,
        title: "Inter-Faculty Football Tournament",
        category: "Sport",
        description: "A football competition that brings together teams from different faculties.",
        status: "In progress"
    },

    {
        id: 3,
        title: "Cultural Heritage Day",
        category: "Culture",
        description: "A celebration of traditional food, music, clothing, dance and cultural knowledge.",
        status: "Pending"
    },

    {
        id: 4,
        title: "Student Debate Championship",
        category: "Academic",
        description: "A debate event that develops public speaking, research and critical thinking.",
        status: "Completed"
    },

    {
        id: 5,
        title: "Campus Fitness Challenge",
        category: "Sport",
        description: "A friendly fitness challenge encouraging students to stay active and healthy.",
        status: "Pending"
    },

    {
        id: 6,
        title: "Poetry and Open Mic Night",
        category: "Culture",
        description: "An evening where students share poetry, spoken word, music and performances.",
        status: "In progress"
    },

    {
        id: 7,
        title: "Research and Technology Symposium",
        category: "Academic",
        description: "Students present research findings and discuss technology with their peers.",
        status: "Completed"
    },

    {
        id: 8,
        title: "Traditional Dance Showcase",
        category: "Culture",
        description: "Student groups perform traditional dances and explain their cultural significance.",
        status: "Pending"
    }

];


// 3. READ RECORDS FROM LOCAL STORAGE

function readRecords() {

    const saved = localStorage.getItem(STORAGE_KEY);

    // Add starting records only the first time.

    if (saved === null) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(startingRecords)
        );

        return [...startingRecords];

    }

    try {

        const records = JSON.parse(saved);

        return Array.isArray(records) ? records : [];

    } catch {

        return [];

    }

}


// 4. SAVE RECORDS TO LOCAL STORAGE

function saveRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );

}


// 5. RECORD SERVICE METHODS

export const recordService = {


    // GET ALL RECORDS

    async list() {

        return readRecords();

    },


    // GET ONE RECORD USING ITS ID

    async get(id) {

        const record = readRecords().find(
            item => item.id === Number(id)
        );

        if (!record) {

            throw new Error(
                "The selected proposal could not be found."
            );

        }

        return record;

    },


    // CREATE A NEW RECORD

    async create(record) {

        const records = readRecords();

        // Generate a unique ID.

        const nextId = records.reduce(
            (largest, item) =>
                Math.max(largest, Number(item.id) || 0),
            0
        ) + 1;


        const newRecord = {

            id: nextId,

            title: record.title,

            category: record.category,

            description: record.description,

            status: record.status

        };


        records.push(newRecord);

        saveRecords(records);

        return newRecord;

    },


    // UPDATE AN EXISTING RECORD

    async update(id, record) {

        const records = readRecords();

        const index = records.findIndex(
            item => item.id === Number(id)
        );


        if (index === -1) {

            throw new Error(
                "The proposal to update could not be found."
            );

        }


        records[index] = {

            id: records[index].id,

            title: record.title,

            category: record.category,

            description: record.description,

            status: record.status

        };


        saveRecords(records);

        return records[index];

    },


    // DELETE A RECORD

    async remove(id) {

        const records = readRecords();

        const updatedRecords = records.filter(
            item => item.id !== Number(id)
        );


        if (updatedRecords.length === records.length) {

            throw new Error(
                "The proposal to delete could not be found."
            );

        }


        saveRecords(updatedRecords);

        return "Proposal deleted successfully.";

    }

};
