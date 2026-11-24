
// ==========================================
// STUDENT EVENT PROPOSALS MANAGEMENT SYSTEM
// ICT251 - ACTIVITY 8
// FRONTEND AND BACKEND INTEGRATION
// ==========================================


// 1. IMPORT DATA SERVICE

import { recordService } from "./data.js";


// 2. SELECT HTML ELEMENTS

const form = document.querySelector("#proposalForm");

const recordIdInput = document.querySelector("#recordId");

const titleInput = document.querySelector("#title");

const categoryInput = document.querySelector("#category");

const descriptionInput = document.querySelector("#description");

const statusInput = document.querySelector("#status");

const formMessage = document.querySelector("#formMessage");

const formHeading = document.querySelector("#formHeading");

const submitButton = document.querySelector("#submitButton");

const cancelEditButton = document.querySelector("#cancelEditButton");

const searchInput = document.querySelector("#searchInput");

const statusFilter = document.querySelector("#statusFilter");

const recordsList = document.querySelector("#recordsList");

const emptyMessage = document.querySelector("#emptyMessage");

const resultCount = document.querySelector("#resultCount");

const descriptionCount = document.querySelector("#descriptionCount");

const detailsDialog = document.querySelector("#detailsDialog");

const menuToggle = document.querySelector("#menuToggle");

const mainNav = document.querySelector("#mainNav");

const recordsMessage = document.querySelector("#recordsMessage");

const retryButton = document.querySelector("#retryButton");


// 3. APPLICATION STATE

let allRecords = [];

let isLoading = false;

let isBusy = false;

let hasLoadError = false;


// 4. DISPLAY FORM MESSAGES

function showFormMessage(message, type = "") {

    formMessage.textContent = message;

    formMessage.className = `message ${type}`;

}


// 5. DISPLAY RECORD MESSAGES

function showRecordsMessage(message, type = "") {

    recordsMessage.textContent = message;

    recordsMessage.className = `message ${type}`;

    recordsMessage.hidden = !message;

}


// 6. FRIENDLY ERROR MESSAGES

function getErrorMessage(error) {

    if (error instanceof TypeError) {

        return "Could not connect to the server. Check your internet connection and try again. The server may be starting.";

    }

    if (error instanceof SyntaxError) {

        return "The server returned an unexpected response. Please try again.";

    }

    return error.message ||
        "Something went wrong. Please try again.";

}


// 7. CONTROL BUTTON AND FORM STATE

function updateControls() {

    const disabled = isBusy || isLoading;

    submitButton.disabled = disabled;

    cancelEditButton.disabled = disabled;

    titleInput.disabled = disabled;

    categoryInput.disabled = disabled;

    descriptionInput.disabled = disabled;

    statusInput.disabled = disabled;

    retryButton.disabled = disabled;

    recordsList.querySelectorAll("button").forEach(button => {

        button.disabled = disabled;

    });

    form.setAttribute("aria-busy", String(isBusy));

    recordsList.setAttribute("aria-busy", String(isLoading));

}


// 8. VALIDATE PROPOSAL INFORMATION

function validateRecord(record) {

    if (
        record.title.length < 3 ||
        record.title.length > 80
    ) {

        return "Title must contain between 3 and 80 characters.";

    }

    if (
        record.category.length < 2 ||
        record.category.length > 40
    ) {

        return "Please select a valid category.";

    }

    if (
        record.description.length < 5 ||
        record.description.length > 300
    ) {

        return "Description must contain between 5 and 300 characters.";

    }

    if (
        !["Pending", "In progress", "Completed"]
            .includes(record.status)
    ) {

        return "Please select a valid status.";

    }

    return "";

}


// 9. LOAD ALL RECORDS FROM THE LIVE API

async function loadRecords() {

    if (isLoading) return false;

    isLoading = true;

    hasLoadError = false;

    retryButton.hidden = true;

    emptyMessage.hidden = true;

    resultCount.textContent = "Loading...";

    recordsList.replaceChildren();

    showRecordsMessage("Loading records... Please wait.");

    updateControls();

    try {

        const records = await recordService.list();

        if (!Array.isArray(records)) {

            throw new Error(
                "The server returned an invalid record list."
            );

        }

        allRecords = records;

        showRecordsMessage("");

        return true;

    } catch (error) {

        hasLoadError = true;

        allRecords = [];

        showRecordsMessage(
            "Could not load proposals. " +
            getErrorMessage(error),
            "error"
        );

        retryButton.hidden = false;

        return false;

    } finally {

        isLoading = false;

        renderRecords();

        renderStatistics();

        updateControls();

    }

}


// 10. UPDATE DASHBOARD STATISTICS

function renderStatistics() {

    if (hasLoadError) {

        document.querySelector("#totalStat").textContent = "—";

        document.querySelector("#pendingStat").textContent = "—";

        document.querySelector("#progressStat").textContent = "—";

        document.querySelector("#completedStat").textContent = "—";

        return;

    }

    document.querySelector("#totalStat").textContent =
        allRecords.length;

    document.querySelector("#pendingStat").textContent =
        allRecords.filter(
            item => item.status === "Pending"
        ).length;

    document.querySelector("#progressStat").textContent =
        allRecords.filter(
            item => item.status === "In progress"
        ).length;

    document.querySelector("#completedStat").textContent =
        allRecords.filter(
            item => item.status === "Completed"
        ).length;

}


// 11. CREATE STATUS LABEL

function makeStatusBadge(status) {

    const badge = document.createElement("span");

    badge.className =
        `status-tag status-${status.toLowerCase().replaceAll(" ", "-")}`;

    badge.textContent = status;

    return badge;

}


// 12. CREATE ACTION BUTTONS

function makeAction(label, action, id, extraClass = "") {

    const button = document.createElement("button");

    button.type = "button";

    button.className =
        `small-action ${extraClass}`.trim();

    button.textContent = label;

    button.disabled = isBusy || isLoading;

    button.addEventListener("click", () => {

        handleRecordAction(action, id);

    });

    return button;

}


// 13. DISPLAY PROPOSALS

function renderRecords() {

    if (isLoading) return;

    recordsList.replaceChildren();

    if (hasLoadError) {

        resultCount.textContent = "Unavailable";

        emptyMessage.hidden = true;

        return;

    }

    const searchTerm =
        searchInput.value.trim().toLowerCase();

    const selectedStatus =
        statusFilter.value;


    // SEARCH AND FILTER

    const visibleRecords = allRecords.filter(record => {

        const matchesTitle =
            record.title.toLowerCase().includes(searchTerm);

        const matchesStatus =
            !selectedStatus ||
            record.status === selectedStatus;

        return matchesTitle && matchesStatus;

    });


    // UPDATE NUMBER OF RESULTS

    resultCount.textContent =
        `${visibleRecords.length} ${
            visibleRecords.length === 1 ? "record" : "records"
        }`;


    // DISPLAY EMPTY MESSAGE

    emptyMessage.hidden =
        visibleRecords.length !== 0;


    // DISPLAY EACH PROPOSAL

    visibleRecords.forEach(record => {

        const item = document.createElement("article");

        item.className = "record-item";

        const main = document.createElement("div");

        main.className = "record-main";

        const title = document.createElement("h4");

        title.className = "record-title";

        title.textContent = record.title;

        const meta = document.createElement("div");

        meta.className = "record-meta";

        const idText = document.createElement("span");

        idText.textContent = `ID: ${record.id}`;

        const category = document.createElement("span");

        category.className = "category-tag";

        category.textContent = record.category;

        meta.append(
            idText,
            category,
            makeStatusBadge(record.status)
        );

        main.append(title, meta);


        // ACTION BUTTONS

        const actions = document.createElement("div");

        actions.className = "record-actions";

        actions.append(

            makeAction("View", "view", record.id),

            makeAction("Edit", "edit", record.id),

            makeAction("Delete", "delete", record.id, "delete")

        );

        item.append(main, actions);

        recordsList.append(item);

    });

}


// 14. VIEW FULL PROPOSAL DETAILS
// GET /api/records/:id

async function showDetails(id) {

    const record = await recordService.get(id);

    document.querySelector("#detailsTitle").textContent =
        record.title;

    document.querySelector("#detailsId").textContent =
        record.id;

    document.querySelector("#detailsCategory").textContent =
        record.category;

    document.querySelector("#detailsStatus").textContent =
        record.status;

    document.querySelector("#detailsDescription").textContent =
        record.description;

    detailsDialog.showModal();

}


// 15. EDIT A PROPOSAL

async function startEditing(id) {

    const record = await recordService.get(id);

    recordIdInput.value = record.id;

    titleInput.value = record.title;

    // Support categories already stored in the database

    const categoryExists = Array.from(categoryInput.options)
        .some(option => option.value === record.category);

    if (!categoryExists) {

        const option = document.createElement("option");

        option.value = record.category;

        option.textContent = record.category;

        categoryInput.append(option);

    }

    categoryInput.value = record.category;

    descriptionInput.value = record.description;

    statusInput.value = record.status;

    formHeading.textContent = "Edit Proposal";

    submitButton.textContent = "Update Proposal";

    cancelEditButton.hidden = false;

    descriptionCount.textContent =
        `${descriptionInput.value.length}/300`;

    showFormMessage(
        "Editing proposal. Make your changes and select Update Proposal."
    );

    document.querySelector("#manage").scrollIntoView({

        behavior: "smooth"

    });

}


// 16. DELETE A PROPOSAL
// DELETE /api/records/:id

async function deleteRecord(id) {

    const record = allRecords.find(

        item => Number(item.id) === Number(id)

    );

    if (!record) {

        throw new Error("Proposal not found.");

    }

    const confirmed = window.confirm(

        `Are you sure you want to delete "${record.title}"?`

    );

    if (!confirmed) return;

    showRecordsMessage("Deleting proposal...");

    await recordService.remove(id);

    if (Number(recordIdInput.value) === Number(id)) {

        resetForm();

    }

    const refreshed = await loadRecords();

    showFormMessage(

        refreshed
            ? "Proposal deleted successfully."
            : "Proposal deleted successfully, but the list could not refresh. Select Retry Connection.",

        "success"

    );

}


// 17. HANDLE RECORD ACTIONS

async function handleRecordAction(action, id) {

    if (isBusy || isLoading) return;

    isBusy = true;

    updateControls();

    try {

        if (action === "view") {

            showRecordsMessage("Loading proposal details...");

            await showDetails(id);

            showRecordsMessage("");

        }

        if (action === "edit") {

            showRecordsMessage("Loading proposal...");

            await startEditing(id);

            showRecordsMessage("");

        }

        if (action === "delete") {

            await deleteRecord(id);

        }

    } catch (error) {

        showRecordsMessage(

            getErrorMessage(error),

            "error"

        );

    } finally {

        isBusy = false;

        updateControls();

        if (
            action === "edit" &&
            Number(recordIdInput.value) === Number(id)
        ) {

            titleInput.focus();

        }

    }

}


// 18. RESET FORM

function resetForm() {

    form.reset();

    recordIdInput.value = "";

    statusInput.value = "Pending";

    formHeading.textContent = "Submit a Proposal";

    submitButton.textContent = "Save Proposal";

    cancelEditButton.hidden = true;

    descriptionCount.textContent = "0/300";

}


// 19. HANDLE FORM SUBMISSION
// POST AND PUT REQUESTS

form.addEventListener("submit", async event => {

    event.preventDefault();

    if (isBusy || isLoading) return;


    // COLLECT FORM INFORMATION

    const record = {

        title: titleInput.value.trim(),

        category: categoryInput.value.trim(),

        description: descriptionInput.value.trim(),

        status: statusInput.value

    };


    // VALIDATE INFORMATION

    const validationMessage = validateRecord(record);

    if (validationMessage) {

        showFormMessage(

            validationMessage,

            "error"

        );

        return;

    }


    // PREVENT DUPLICATE SUBMISSIONS

    const editingId = recordIdInput.value;

    isBusy = true;

    updateControls();

    submitButton.textContent = editingId

        ? "Updating..."

        : "Saving...";

    showFormMessage("Please wait...");


    try {

        let savedRecord;

        if (editingId) {

            // PUT - UPDATE EXISTING PROPOSAL

            savedRecord = await recordService.update(

                editingId,

                record

            );

        } else {

            // POST - CREATE NEW PROPOSAL

            savedRecord = await recordService.create(record);

        }


        // BACKEND HAS CONFIRMED SUCCESS

        const successMessage = editingId

            ? `Proposal #${savedRecord.id} updated successfully.`

            : `Proposal #${savedRecord.id} added successfully.`;


        // CLEAR FORM ONLY AFTER SUCCESS

        resetForm();


        // REFRESH RECORDS FROM DATABASE

        const refreshed = await loadRecords();

        showFormMessage(

            refreshed
                ? successMessage
                : successMessage +
                  " The list could not refresh. Select Retry Connection.",

            "success"

        );

    } catch (error) {

        // KEEP FORM INPUT IF REQUEST FAILS

        showFormMessage(

            getErrorMessage(error),

            "error"

        );

    } finally {

        // RESTORE BUTTON STATE

        isBusy = false;

        submitButton.textContent = recordIdInput.value

            ? "Update Proposal"

            : "Save Proposal";

        updateControls();

    }

});


// 20. CANCEL EDITING

cancelEditButton.addEventListener("click", () => {

    if (isBusy || isLoading) return;

    resetForm();

    showFormMessage(

        "Edit cancelled. No changes were saved."

    );

});


// 21. SEARCH PROPOSALS

searchInput.addEventListener("input", renderRecords);


// 22. FILTER PROPOSALS BY STATUS

statusFilter.addEventListener("change", renderRecords);


// 23. DESCRIPTION CHARACTER COUNTER

descriptionInput.addEventListener("input", () => {

    descriptionCount.textContent =

        `${descriptionInput.value.length}/300`;

});


// 24. RETRY DATABASE CONNECTION

retryButton.addEventListener("click", () => {

    if (isBusy || isLoading) return;

    loadRecords();

});


// 25. CLOSE DETAILS DIALOG

document.querySelector("#closeDialogButton")

    .addEventListener("click", () => {

        detailsDialog.close();

    });


document.querySelector("#doneDialogButton")

    .addEventListener("click", () => {

        detailsDialog.close();

    });


// 26. MOBILE NAVIGATION

menuToggle.addEventListener("click", () => {

    const isOpen =

        mainNav.classList.toggle("open");

    menuToggle.setAttribute(

        "aria-expanded",

        String(isOpen)

    );

});


// CLOSE MOBILE MENU AFTER SELECTING A LINK

mainNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

        mainNav.classList.remove("open");

        menuToggle.setAttribute(

            "aria-expanded",

            "false"

        );

        mainNav.querySelectorAll("a").forEach(item => {

            item.classList.remove("active");

        });

        link.classList.add("active");

    });

});


// 27. START APPLICATION

loadRecords();
