document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display tasks when the page loads
    fetchTasks();
});

function fetchTasks() {
    fetch('tasks.php')
        .then(response => response.json())
        .then(data => displayTasks(data))
        .catch(error => console.error('Error fetching tasks:', error));
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task');
        taskItem.innerHTML = `<input type="checkbox" onchange="toggleCompletedTask(${task.id})">
                             <span>${task.task_name}</span>
                             <button onclick="editTask(${task.id})">Edit</button>
                             <button onclick="deleteTask(${task.id})">Delete</button>`;
        taskList.appendChild(taskItem);

        // Update: Include details, created_at, and updated_at
        taskItem.innerHTML += `<div class="details-container" onclick="viewTaskDetails(${task.id})">View Details</div>`;
    });
}

function openModal() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'none';
}

function openEditModal(taskId, taskName, taskDetails) {
    const editModal = document.getElementById('editTaskModal');
    const editTaskInput = document.getElementById('editTaskName');
    const editTaskDetails = document.getElementById('editTaskDetails');
    editTaskInput.value = taskName;
    editTaskDetails.value = taskDetails; // New line to populate details in the edit modal
    editModal.style.display = 'block';
    const saveEditBtn = document.getElementById('saveEditBtn');
    saveEditBtn.onclick = function () {
        saveEditedTask(taskId, editTaskInput.value, editTaskDetails.value);
    };
}

function closeEditModal() {
    const editModal = document.getElementById('editTaskModal');
    editModal.style.display = 'none';
}

function openFeedbackModal(message) {
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackMessage = document.getElementById('feedbackMessage');
    feedbackMessage.textContent = message;
    feedbackModal.style.display = 'block';
}

function closeFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    feedbackModal.style.display = 'none';
}

function addTask() {
    const taskName = document.getElementById('task').value;
    const details = document.getElementById('details').value;

    fetch('tasks.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskName: taskName,
            details: details,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchTasks(); // Update task list after successful addition
                openFeedbackModal('Task added successfully!');
            } else {
                console.error('Error adding task:', data.error);
                openFeedbackModal('Error adding task. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error adding task:', error);
            openFeedbackModal('Error adding task. Please try again.');
        });

    closeModal();
}

function toggleCompletedTask(taskId) {
    const status = document.querySelector(`input[data-id="${taskId}"]`).checked;

    fetch(`tasks.php?id=${taskId}&status=${status}`, {
        method: 'PUT',
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchTasks(); // Update task list after successful update
                openFeedbackModal('Task status updated successfully!');
            } else {
                console.error('Error updating task status:', data.error);
                openFeedbackModal('Error updating task status. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error updating task status:', error);
            openFeedbackModal('Error updating task status. Please try again.');
        });
}

function editTask(taskId) {
    const taskInput = document.querySelector(`div.task input[data-id="${taskId}"]`);
    const taskName = taskInput ? taskInput.nextElementSibling.textContent : '';

    // Fetch task details and populate the edit modal
    fetch(`tasks.php?id=${taskId}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const taskDetails = data[0].details;
                openEditModal(taskId, taskName, taskDetails);
            } else {
                console.error('Task not found');
            }
        })
        .catch(error => console.error('Error fetching task details:', error));
}

function saveEditedTask(taskId, newTaskName, newTaskDetails) {
    fetch(`tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskName: newTaskName,
            details: newTaskDetails, // New line to include details in the request body
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchTasks(); // Update task list after successful update
                closeEditModal();
                openFeedbackModal('Task edited successfully!');
            } else {
                console.error('Error editing task:', data.error);
                openFeedbackModal('Error editing task. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error editing task:', error);
            openFeedbackModal('Error editing task. Please try again.');
        });
}

function deleteTask(taskId) {
    fetch(`tasks.php?id=${taskId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchTasks(); // Update task list after successful deletion
                openFeedbackModal('Task deleted successfully!');
            } else {
                console.error('Error deleting task:', data.error);
                openFeedbackModal('Error deleting task. Pleasetry again.');
            }
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            openFeedbackModal('Error deleting task. Please try again.');
        });
}

// New function to view task details
function viewTaskDetails(taskId) {
    fetch(`tasks.php?id=${taskId}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const taskDetails = data[0].details;
                const createdDate = data[0].created_at;
                const lastUpdatedDate = data[0].updated_at;

                // Populate task details modal
                document.getElementById('taskDetails').textContent = taskDetails;
                document.getElementById('createdDate').textContent = createdDate;
                document.getElementById('lastUpdatedDate').textContent = lastUpdatedDate;

                // Display task details modal
                const taskDetailsModal = document.getElementById('taskDetailsModal');
                taskDetailsModal.style.display = 'block';
            } else {
                console.error('Task not found');
            }
        })
        .catch(error => console.error('Error fetching task details:', error));
}

// New function to close task details modal
function closeTaskDetailsModal() {
    const taskDetailsModal = document.getElementById('taskDetailsModal');
    taskDetailsModal.style.display = 'none';
}
