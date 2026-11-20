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


// 3. STORE ALL RECORDS IN MEMORY

let allRecords = [];


// 4. DISPLAY FORM MESSAGES

function showFormMessage(message, type = "") {

    formMessage.textContent = message;

    formMessage.className = `message ${type}`;

}


// 5. VALIDATE PROPOSAL INFORMATION

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


// 6. LOAD ALL RECORDS

async function loadRecords() {

    allRecords = await recordService.list();

    renderRecords();

    renderStatistics();

}


// 7. UPDATE DASHBOARD STATISTICS

function renderStatistics() {

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


// 8. CREATE STATUS LABEL

function makeStatusBadge(status) {

    const badge = document.createElement("span");

    badge.className =
        `status-tag status-${status.toLowerCase().replaceAll(" ", "-")}`;

    badge.textContent = status;

    return badge;

}


// 9. CREATE ACTION BUTTONS

function makeAction(label, action, id, extraClass = "") {

    const button = document.createElement("button");

    button.type = "button";

    button.className =
        `small-action ${extraClass}`.trim();

    button.textContent = label;


    button.addEventListener("click", () => {

        handleRecordAction(action, id);

    });


    return button;

}


// 10. DISPLAY PROPOSALS

function renderRecords() {

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


    // CLEAR OLD DISPLAY

    recordsList.replaceChildren();


    // UPDATE NUMBER OF RESULTS

    resultCount.textContent =
        `${visibleRecords.length} ${
            visibleRecords.length === 1 ? "record" : "records"
        }`;


    // SHOW EMPTY MESSAGE IF NO RESULTS

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


// 11. VIEW FULL PROPOSAL DETAILS

async function showDetails(id) {

    try {

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

    } catch (error) {

        showFormMessage(error.message, "error");

    }

}


// 12. EDIT A PROPOSAL

async function startEditing(id) {

    try {

        const record = await recordService.get(id);


        // PUT EXISTING INFORMATION INTO FORM

        recordIdInput.value = record.id;

        titleInput.value = record.title;

        categoryInput.value = record.category;

        descriptionInput.value = record.description;

        statusInput.value = record.status;


        // CHANGE BUTTON TEXT

        submitButton.textContent = "Update Proposal";


        // SHOW CANCEL BUTTON

        cancelEditButton.hidden = false;


        showFormMessage(
            "Editing proposal. Make your changes and select Update proposal.",
            "success"
        );


        // SCROLL TO FORM

        document.querySelector("#manage").scrollIntoView({
            behavior: "smooth"
        });


        titleInput.focus();

    } catch (error) {

        showFormMessage(error.message, "error");

    }

}


// 13. DELETE A PROPOSAL

async function deleteRecord(id) {

    const record = allRecords.find(
        item => item.id === Number(id)
    );


    if (!record) return;


    // ASK FOR CONFIRMATION

    const confirmed = window.confirm(
        `Are you sure you want to delete "${record.title}"?`
    );


    // STOP IF USER SELECTS CANCEL

    if (!confirmed) return;


    try {

        await recordService.remove(id);


        showFormMessage(
            "Proposal deleted successfully.",
            "success"
        );


        await loadRecords();

    } catch (error) {

        showFormMessage(error.message, "error");

    }

}


// 14. HANDLE RECORD ACTIONS

async function handleRecordAction(action, id) {

    if (action === "view") {

        await showDetails(id);

    }


    if (action === "edit") {

        await startEditing(id);

    }


    if (action === "delete") {

        await deleteRecord(id);

    }

}


// 15. RESET FORM

function resetForm() {

    form.reset();

    recordIdInput.value = "";

    statusInput.value = "Pending";

    submitButton.textContent = "Save Proposal";

    cancelEditButton.hidden = true;

    descriptionCount.textContent = "0/300";

}

// 16. HANDLE FORM SUBMISSION

form.addEventListener("submit", async event => {

    event.preventDefault();

    const record = {
        title: titleInput.value.trim(),
        category: categoryInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusInput.value
    };

    const validationMessage = validateRecord(record);

    if (validationMessage) {
        showFormMessage(validationMessage, "error");
        return;
    }

    try {

        // Disable button while request is running.
        submitButton.disabled = true;

        if (recordIdInput.value) {

            await recordService.update(
                recordIdInput.value,
                record
            );

            showFormMessage(
                "Proposal updated successfully.",
                "success"
            );

        } else {

            await recordService.create(record);

            showFormMessage(
                "Proposal added successfully.",
                "success"
            );

        }

        resetForm();

        await loadRecords();

    } catch (error) {

        showFormMessage(
            error.message || "Something went wrong. Please try again.",
            "error"
        );

    } finally {

        // Re-enable button whether successful or not.
        submitButton.disabled = false;

    }

});
    // VALIDATE INFORMATION

    const validationMessage =
        validateRecord(record);


    if (validationMessage) {

        showFormMessage(
            validationMessage,
            "error"
        );

        return;

    }


    try {

        // UPDATE OR CREATE RECORD

        if (recordIdInput.value) {

            await recordService.update(
                recordIdInput.value,
                record
            );


            showFormMessage(
                "Proposal updated successfully.",
                "success"
            );

        } else {

            await recordService.create(record);


            showFormMessage(
                "Proposal added successfully.",
                "success"
            );

        }


        // CLEAR FORM

        resetForm();


        // REFRESH DISPLAY

        await loadRecords();


    } catch (error) {

        showFormMessage(
            error.message || "Something went wrong. Please try again.",
            "error"
        );

    }




// 17. CANCEL EDITING

cancelEditButton.addEventListener("click", () => {

    resetForm();

    showFormMessage(
        "Edit cancelled. No changes were saved."
    );

});


// 18. SEARCH PROPOSALS

searchInput.addEventListener("input", renderRecords);


// 19. FILTER PROPOSALS BY STATUS

statusFilter.addEventListener("change", renderRecords);


// 20. DESCRIPTION CHARACTER COUNTER

descriptionInput.addEventListener("input", () => {

    descriptionCount.textContent =
        `${descriptionInput.value.length}/300`;

});


// 21. CLOSE DETAILS DIALOG

document.querySelector("#closeDialogButton")
    .addEventListener("click", () => {

        detailsDialog.close();

    });


document.querySelector("#doneDialogButton")
    .addEventListener("click", () => {

        detailsDialog.close();

    });


// 22. MOBILE NAVIGATION

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


// 23. START APPLICATION

loadRecords().catch(error => {

    showFormMessage(
        `Could not load proposals: ${error.message}`,
        "error"
    );

});
