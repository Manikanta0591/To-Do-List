document.addEventListener('DOMContentLoaded', () => {
    const activeTaskTableBody = document.getElementById('activeTaskTableBody');
    const historyTaskTableBody = document.getElementById('historyTaskTableBody');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const taskModalLabel = document.getElementById('taskModalLabel');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskForm = document.getElementById('taskForm');
    const taskIdInput = document.getElementById('taskId');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskResponsibleInput = document.getElementById('taskResponsible');
    const taskETAInput = document.getElementById('taskETA');

    const taskModalElement = document.getElementById('taskModal');
    const taskModalBootstrap = new bootstrap.Modal(taskModalElement);

    let activeTasks = []; 
    let completedTasksHistory = []; 

    const loadData = () => {
        const storedActiveTasks = localStorage.getItem('activeTasks');
        const storedCompletedTasksHistory = localStorage.getItem('completedTasksHistory');
        
        if (storedActiveTasks) {
            activeTasks = JSON.parse(storedActiveTasks);
        }
        if (storedCompletedTasksHistory) {
            completedTasksHistory = JSON.parse(storedCompletedTasksHistory);
        }
        console.log("--- LOADED DATA ---");
        console.log("  activeTasks:", activeTasks);
        console.log("  completedTasksHistory:", completedTasksHistory);
    };

    const saveData = () => {
        localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
        localStorage.setItem('completedTasksHistory', JSON.stringify(completedTasksHistory));
        console.log("--- SAVED DATA ---");
        console.log("  activeTasks:", activeTasks);
        console.log("  completedTasksHistory:", completedTasksHistory);
    };

    const generateId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const formatETA = (etaString) => {
        if (!etaString) return 'N/A';
        const date = new Date(etaString);
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata',
            timeZoneName: 'short'
        };
        return date.toLocaleString('en-IN', options);
    };

    const formatCompletionDate = () => {
        const date = new Date();
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata',
            timeZoneName: 'short'
        };
        return date.toLocaleString('en-IN', options);
    };

    const initializeTooltips = () => {
        document.querySelectorAll('.tooltip').forEach(tooltipEl => tooltipEl.remove());
        
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    };

    const renderActiveTasks = () => {
        activeTaskTableBody.innerHTML = '';
        if (activeTasks.length === 0) {
            noTasksMessage.classList.remove('d-none');
        } else {
            noTasksMessage.classList.add('d-none');
            activeTasks.forEach((task, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${task.description}</td>
                    <td>${task.responsible}</td>
                    <td>${formatETA(task.eta)}</td>
                    <td class="text-center">
                        <button class="action-btn complete-btn" data-id="${task.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Mark as Complete">
                            <i class="far fa-circle"></i>
                        </button>
                        <button class="action-btn edit-btn" data-id="${task.id}" data-bs-toggle="modal" data-bs-target="#taskModal" data-bs-toggle="tooltip" data-bs-placement="top" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${task.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete Task">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                activeTaskTableBody.appendChild(row);
            });
        }
        initializeTooltips();
    };

    const renderHistory = () => {
        console.log("--- RENDERING HISTORY ---");
        console.log("  completedTasksHistory for rendering:", completedTasksHistory);

        historyTaskTableBody.innerHTML = ''; 

        if (completedTasksHistory.length === 0) {
            console.log("  History array is empty. Showing noHistoryMessage.");
            noHistoryMessage.classList.remove('d-none');
            clearHistoryBtn.classList.add('d-none');
        } else {
            console.log("  History array has items. Hiding noHistoryMessage, showing Clear History button.");
            noHistoryMessage.classList.add('d-none');
            clearHistoryBtn.classList.remove('d-none');
            
            completedTasksHistory.forEach((task, index) => {
                console.log(`  Adding history row for task: ${task.description}`);
                const row = document.createElement('tr');
                row.classList.add('task-completed');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${task.description}</td>
                    <td>${task.responsible}</td>
                    <td>${task.completionDate}</td>
                    <td class="text-center">
                        <button class="action-btn delete-btn delete-history-btn" data-id="${task.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete from History">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                historyTaskTableBody.appendChild(row);
            });
        }
        initializeTooltips();
    };

    const addTask = (description, responsible, eta) => {
        const newTask = {
            id: generateId(),
            description,
            responsible,
            eta,
        };
        activeTasks.push(newTask);
        saveData();
        renderActiveTasks();
    };

    const editTask = (id, description, responsible, eta) => {
        const taskToEdit = activeTasks.find(task => task.id === id);
        if (taskToEdit) {
            taskToEdit.description = description;
            taskToEdit.responsible = responsible;
            taskToEdit.eta = eta;
            saveData();
            renderActiveTasks();
        }
    };

    const markAsComplete = (id) => {
        const index = activeTasks.findIndex(task => task.id === id);
        if (index > -1) {
            const completedTask = activeTasks.splice(index, 1)[0]; 
            completedTask.completionDate = formatCompletionDate(); 
            completedTasksHistory.push(completedTask);
            console.log("--- MARK AS COMPLETE - AFTER MOVE ---");
            console.log("  Current activeTasks:", activeTasks);
            console.log("  Current completedTasksHistory:", completedTasksHistory);
            saveData();
            renderActiveTasks(); 
            renderHistory(); 
        }
    };

    const deleteActiveTask = (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            activeTasks = activeTasks.filter(task => task.id !== id);
            saveData();
            renderActiveTasks();
        }
    };

    const deleteHistoryTask = (id) => {
        if (confirm('Are you sure you want to remove this task from history?')) {
            completedTasksHistory = completedTasksHistory.filter(task => task.id !== id);
            saveData();
            renderHistory();
        }
    };

    const clearAllHistory = () => {
        if (confirm('Are you sure you want to clear ALL completed tasks from history? This action cannot be undone.')) {
            completedTasksHistory = [];
            saveData();
            renderHistory();
        }
    };
    
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        taskDescriptionInput.classList.remove('is-invalid');
        taskResponsibleInput.classList.remove('is-invalid');
        taskETAInput.classList.remove('is-invalid');

        const description = taskDescriptionInput.value.trim();
        const responsible = taskResponsibleInput.value.trim();
        const eta = taskETAInput.value;

        let isValid = true;
        if (!description) {
            taskDescriptionInput.classList.add('is-invalid');
            isValid = false;
        }
        if (!responsible) {
            taskResponsibleInput.classList.add('is-invalid');
            isValid = false;
        }
        if (!eta) {
            taskETAInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            return; 
        }

        const taskId = taskIdInput.value;
        if (taskId) {
            editTask(taskId, description, responsible, eta);
        } else {
            addTask(description, responsible, eta);
        }

        taskModalBootstrap.hide();
    });

    activeTaskTableBody.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const taskId = button.dataset.id;
        
        if (button.classList.contains('complete-btn')) {
            markAsComplete(taskId);
        } else if (button.classList.contains('edit-btn')) {
            const taskToEdit = activeTasks.find(task => task.id === taskId);
            if (taskToEdit) {
                taskModalLabel.textContent = 'Edit Task';
                saveTaskBtn.textContent = 'Update Task';
                taskIdInput.value = taskToEdit.id;
                taskDescriptionInput.value = taskToEdit.description;
                taskResponsibleInput.value = taskToEdit.responsible;
                taskETAInput.value = taskToEdit.eta;
                taskModalBootstrap.show(); 
            }
        } else if (button.classList.contains('delete-btn')) {
            deleteActiveTask(taskId);
        }
    });

    historyTaskTableBody.addEventListener('click', (e) => {
        const button = e.target.closest('.delete-history-btn');
        if (!button) return;
        const taskId = button.dataset.id;
        deleteHistoryTask(taskId);
    });

    clearHistoryBtn.addEventListener('click', clearAllHistory);

    taskModalElement.addEventListener('show.bs.modal', (e) => {
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && relatedTarget.id === 'addTaskBtn') {
            taskModalLabel.textContent = 'Add New Task';
            saveTaskBtn.textContent = 'Save Task';
            taskForm.reset(); 
            taskIdInput.value = '';
            taskDescriptionInput.classList.remove('is-invalid');
            taskResponsibleInput.classList.remove('is-invalid');
            taskETAInput.classList.remove('is-invalid');
        }
    });
    
    loadData(); 
    renderActiveTasks(); 
    renderHistory(); 

    initializeTooltips();
});