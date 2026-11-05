let config = null;
let editingTaskId = null;

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const submitButton = document.getElementById("task-submit");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
const formHeading = document.getElementById("form-heading");
const refreshButton = document.getElementById("refresh-tasks");

// Display messages
function showMessage(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? "#dc2626" : "#15803d";
}

// Supabase API configuration
function getApiUrl() {
    return `${config.supabaseUrl}/rest/v1/${config.tableName}`;
}

function getHeaders(extraHeaders = {}) {
    return {
        "apikey": config.supabasePublishableKey,
        "Authorization": `Bearer ${config.supabasePublishableKey}`,
        "Content-Type": "application/json",
        ...extraHeaders
    };
}

// Send requests to Supabase
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: getHeaders(options.headers || {})
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// READ: Load tasks from database
async function loadTasks() {
    try {
        showMessage("Loading tasks...");

        const tasks = await apiRequest(
            `${getApiUrl()}?select=*&order=id.desc`
        );

        renderTasks(tasks || []);
        showMessage("Tasks loaded successfully.");

    } catch (error) {
        showMessage("Failed to load tasks: " + error.message, true);
    }
}

// Display tasks
function renderTasks(tasks) {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No tasks yet. Add your first task!";
        taskList.appendChild(emptyMessage);
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";
        item.dataset.id = task.id;

        const title = document.createElement("h3");
        title.className = "task-title";
        title.textContent = task.title;

        const description = document.createElement("p");
        description.className = "task-description";
        description.textContent = task.description || "No description";

        const status = document.createElement("span");
        status.className = "task-status";
        status.textContent = task.completed ? "Completed" : "Incomplete";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-task";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editTask(task));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-task";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "toggle-task";
        toggleButton.textContent = task.completed
            ? "Mark incomplete"
            : "Mark complete";
        toggleButton.addEventListener("click", () => toggleTask(task));

        item.append(
            title,
            description,
            status,
            editButton,
            deleteButton,
            toggleButton
        );

        taskList.appendChild(item);
    });
}

// CREATE and UPDATE: Save a task
form.addEventListener("submit", async event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        showMessage("Task title is required.", true);
        titleInput.focus();
        return;
    }

    const taskData = {
        title: title,
        description: description
    };

    try {
        submitButton.disabled = true;

        if (editingTaskId !== null) {
            await apiRequest(
                `${getApiUrl()}?id=eq.${editingTaskId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Prefer": "return=representation"
                    },
                    body: JSON.stringify(taskData)
                }
            );

            showMessage("Task updated successfully.");

        } else {
            await apiRequest(getApiUrl(), {
                method: "POST",
                headers: {
                    "Prefer": "return=representation"
                },
                body: JSON.stringify(taskData)
            });

            showMessage("Task created successfully.");
        }

        resetForm();
        await loadTasks();

    } catch (error) {
        showMessage("Could not save task: " + error.message, true);

    } finally {
        submitButton.disabled = false;
    }
});

// EDIT: Put task information into the form
function editTask(task) {
    editingTaskId = task.id;

    titleInput.value = task.title;
    descriptionInput.value = task.description || "";

    submitButton.textContent = "Save changes";
    formHeading.textContent = "Edit task";

    showMessage("Editing task #" + task.id);
    titleInput.focus();
}

// UPDATE: Mark task completed or incomplete
async function toggleTask(task) {
    try {
        await apiRequest(
            `${getApiUrl()}?id=eq.${task.id}`,
            {
                method: "PATCH",
                headers: {
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    completed: !task.completed
                })
            }
        );

        showMessage("Task status updated.");
        await loadTasks();

    } catch (error) {
        showMessage("Could not update task: " + error.message, true);
    }
}

// DELETE: Remove task
async function deleteTask(id) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(
            `${getApiUrl()}?id=eq.${id}`,
            {
                method: "DELETE",
                headers: {
                    "Prefer": "return=minimal"
                }
            }
        );

        if (editingTaskId === id) {
            resetForm();
        }

        showMessage("Task deleted successfully.");
        await loadTasks();

    } catch (error) {
        showMessage("Could not delete task: " + error.message, true);
    }
}

// Reset form
function resetForm() {
    form.reset();

    editingTaskId = null;
    submitButton.textContent = "Add task";
    formHeading.textContent = "Add a task";
}

// Refresh button
refreshButton.addEventListener("click", loadTasks);

// Initialize application
async function initializeApp() {
    try {
        showMessage("Connecting to Supabase...");

        const response = await fetch("./config.json");

        if (!response.ok) {
            throw new Error("Could not load config.json");
        }

        config = await response.json();

        if (
            !config.supabaseUrl ||
            !config.supabasePublishableKey ||
            !config.tableName
        ) {
            throw new Error("Supabase configuration is incomplete.");
        }

        await loadTasks();

    } catch (error) {
        showMessage("Application initialization failed: " + error.message, true);
    }
}

initializeApp();