// --- 1. GET REFERENCES TO INITIAL HTML ELEMENTS ---
const addTaskButton = document.querySelector('.add_task');
const setPlanButton = document.querySelector('.set_plan');
const viewCompletedButton = document.querySelector('.view_tasks-completed');
const rightSection = document.querySelector('.right_section');

// --- 2. STORAGE KEYS ---
const PLANS_STORAGE_KEY = 'taskTrackerPlans';
const COMPLETED_TASKS_STORAGE_KEY = 'taskTrackerCompletedTasks';

// --- 3. LISTEN FOR CLICKS ON ALL BUTTONS ---
addTaskButton.addEventListener('click', showTaskView);
setPlanButton.addEventListener('click', showPlanView);
viewCompletedButton.addEventListener('click', showCompletedTasksView);

// --- 3. DEFINE THE FUNCTION TO CHANGE THE VIEW ---
function showTaskView() {
    // This part is the same as before: create and display the task view HTML
    const taskViewHTML = `
        <div class="task-container">
            <section class="input-section">
                <h2>Add a New Task</h2>
                <form id="new-task-form">
                    <input 
                        type="text" 
                        id="new-task-input" 
                        placeholder="e.g., Finish project report" 
                        aria-label="New task input"
                        autocomplete="off"
                    />
                    <button type="submit" id="add-task-btn">Add</button>
                </form>
            </section>
            <section class="task-list-section">
                <h2>My Tasks</h2>
                <ul id="task-list">
                    <!-- Tasks will be added here by JavaScript -->
                </ul>
            </section>
        </div>
    `;
    rightSection.innerHTML = taskViewHTML;

    // --- NEW CODE STARTS HERE ---
    // Now that the new HTML is on the page, we can get references to it.
    const form = document.querySelector('#new-task-form');
    const input = document.querySelector('#new-task-input');
    const taskList = document.querySelector('#task-list');

    // Add a 'submit' event listener to the form
    form.addEventListener('submit', (e) => {
        // 1. Prevent the page from refreshing on form submission
        e.preventDefault(); 

        // 2. Get the text from the input field (and trim whitespace)
        const taskText = input.value.trim();

        // 3. Validate: If the input is empty, do nothing
        if (taskText === "") {
            alert("Please enter a task!");
            return;
        }

        // 4. Create a new task list item (<li>) element
        const taskElement = document.createElement('li');
        taskElement.classList.add('task-item'); // Add a class for styling

        // 5. Set the inner HTML of the new list item
        // We include the task text and buttons for complete/delete
        taskElement.innerHTML = `
            <span class="task-text">${taskText}</span>
            <div class="task-actions">
                <button class="complete-btn">✔️</button>
                <button class="delete-btn">❌</button>
            </div>
        `;

        // 6. Append the new task element to the task list (<ul>)
        taskList.appendChild(taskElement);

        // 7. Clear the input field for the next entry
        input.value = "";
    });

    // Add event listeners for task actions (complete/delete)
    setupTaskActionListeners();
}

// --- PLAN MANAGEMENT FUNCTIONS ---
function showPlanView() {
    const plans = getStoredPlans();
    
    const planViewHTML = `
        <div class="task-container">
            <section class="input-section">
                <h2>Create New Plan</h2>
                <form id="new-plan-form">
                    <input 
                        type="text" 
                        id="plan-title-input" 
                        placeholder="Plan title (e.g., Weekly Goals)" 
                        aria-label="Plan title"
                        autocomplete="off"
                        required
                    />
                    <textarea 
                        id="plan-description-input" 
                        placeholder="Describe your plan in detail..." 
                        aria-label="Plan description"
                        rows="4"
                        required
                    ></textarea>
                    <button type="submit" id="add-plan-btn">Create Plan</button>
                </form>
            </section>
            <section class="task-list-section">
                <h2>My Plans</h2>
                <div id="plans-list">
                    ${plans.length === 0 ? '<p style="color: #666; text-align: center; padding: 2rem;">No plans created yet. Create your first plan above!</p>' : ''}
                </div>
            </section>
        </div>
    `;
    
    rightSection.innerHTML = planViewHTML;
    renderPlans(plans);
    setupPlanFormListener();
}

function setupPlanFormListener() {
    const form = document.querySelector('#new-plan-form');
    const titleInput = document.querySelector('#plan-title-input');
    const descriptionInput = document.querySelector('#plan-description-input');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (title === "" || description === "") {
            alert("Please fill in both title and description!");
            return;
        }
        
        const newPlan = {
            id: Date.now(),
            title: title,
            description: description,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        const plans = getStoredPlans();
        plans.push(newPlan);
        savePlans(plans);
        
        // Clear form
        titleInput.value = "";
        descriptionInput.value = "";
        
        // Refresh display
        renderPlans(plans);
    });
}

function renderPlans(plans) {
    const plansList = document.querySelector('#plans-list');
    
    if (plans.length === 0) {
        plansList.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No plans created yet. Create your first plan above!</p>';
        return;
    }
    
    plansList.innerHTML = plans.map(plan => `
        <div class="plan-item" data-plan-id="${plan.id}">
            <div class="plan-header">
                <h3 class="plan-title">${plan.title}</h3>
                <div class="plan-actions">
                    <button class="edit-plan-btn" onclick="editPlan(${plan.id})">✏️</button>
                    <button class="delete-plan-btn" onclick="deletePlan(${plan.id})">❌</button>
                </div>
            </div>
            <p class="plan-description">${plan.description}</p>
            <div class="plan-meta">
                <small>Created: ${new Date(plan.createdAt).toLocaleDateString()}</small>
                <span class="plan-status ${plan.status}">${plan.status}</span>
            </div>
        </div>
    `).join('');
}

function editPlan(planId) {
    const plans = getStoredPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) return;
    
    const newTitle = prompt("Edit plan title:", plan.title);
    if (newTitle === null) return; // User cancelled
    
    const newDescription = prompt("Edit plan description:", plan.description);
    if (newDescription === null) return; // User cancelled
    
    if (newTitle.trim() === "" || newDescription.trim() === "") {
        alert("Title and description cannot be empty!");
        return;
    }
    
    plan.title = newTitle.trim();
    plan.description = newDescription.trim();
    plan.updatedAt = new Date().toISOString();
    
    savePlans(plans);
    renderPlans(plans);
}

function deletePlan(planId) {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    const plans = getStoredPlans();
    const filteredPlans = plans.filter(p => p.id !== planId);
    savePlans(filteredPlans);
    renderPlans(filteredPlans);
}

// --- COMPLETED TASKS FUNCTIONS ---
function showCompletedTasksView() {
    const completedTasks = getStoredCompletedTasks();
    
    const completedViewHTML = `
        <div class="task-container">
            <section class="task-list-section">
                <h2>Completed Tasks</h2>
                <div class="completed-stats">
                    <p>Total completed: <strong>${completedTasks.length}</strong></p>
                </div>
                <div id="completed-tasks-list">
                    ${completedTasks.length === 0 ? '<p style="color: #666; text-align: center; padding: 2rem;">No completed tasks yet. Complete some tasks to see them here!</p>' : ''}
                </div>
            </section>
        </div>
    `;
    
    rightSection.innerHTML = completedViewHTML;
    renderCompletedTasks(completedTasks);
}

function renderCompletedTasks(completedTasks) {
    const tasksList = document.querySelector('#completed-tasks-list');
    
    if (completedTasks.length === 0) {
        tasksList.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No completed tasks yet. Complete some tasks to see them here!</p>';
        return;
    }
    
    // Sort by completion date (newest first)
    const sortedTasks = completedTasks.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    tasksList.innerHTML = sortedTasks.map(task => `
        <div class="completed-task-item">
            <div class="completed-task-content">
                <span class="completed-task-text">${task.text}</span>
                <div class="completed-task-meta">
                    <small>Completed: ${new Date(task.completedAt).toLocaleString()}</small>
                </div>
            </div>
            <div class="completed-task-actions">
                <button class="restore-task-btn" onclick="restoreTask('${task.id}')" title="Restore to active tasks">↩️</button>
                <button class="permanent-delete-btn" onclick="permanentDeleteTask('${task.id}')" title="Permanently delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

function restoreTask(taskId) {
    if (!confirm("Restore this task to your active task list?")) return;
    
    const completedTasks = getStoredCompletedTasks();
    const task = completedTasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Remove from completed tasks
    const filteredCompleted = completedTasks.filter(t => t.id !== taskId);
    saveCompletedTasks(filteredCompleted);
    
    // Add back to active tasks (you'll need to implement this when you enhance the task system)
    alert("Task restored! (Note: This will be enhanced when we integrate with the main task system)");
    
    // Refresh display
    renderCompletedTasks(filteredCompleted);
}

function permanentDeleteTask(taskId) {
    if (!confirm("Are you sure you want to permanently delete this task? This cannot be undone.")) return;
    
    const completedTasks = getStoredCompletedTasks();
    const filteredTasks = completedTasks.filter(t => t.id !== taskId);
    saveCompletedTasks(filteredTasks);
    renderCompletedTasks(filteredTasks);
}

// --- STORAGE FUNCTIONS ---
function getStoredPlans() {
    try {
        const stored = localStorage.getItem(PLANS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading plans:', error);
        return [];
    }
}

function savePlans(plans) {
    try {
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
        console.error('Error saving plans:', error);
        alert('Error saving plans. Please try again.');
    }
}

function getStoredCompletedTasks() {
    try {
        const stored = localStorage.getItem(COMPLETED_TASKS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading completed tasks:', error);
        return [];
    }
}

function saveCompletedTasks(tasks) {
    try {
        localStorage.setItem(COMPLETED_TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving completed tasks:', error);
        alert('Error saving completed tasks. Please try again.');
    }
}

// --- TASK ACTION LISTENERS ---
function setupTaskActionListeners() {
    // Use event delegation for dynamically added tasks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('complete-btn')) {
            const taskItem = e.target.closest('.task-item');
            const taskText = taskItem.querySelector('.task-text').textContent;
            
            // Add to completed tasks
            const completedTasks = getStoredCompletedTasks();
            const completedTask = {
                id: Date.now().toString(),
                text: taskText,
                completedAt: new Date().toISOString()
            };
            completedTasks.push(completedTask);
            saveCompletedTasks(completedTasks);
            
            // Remove from active tasks
            taskItem.remove();
            
            // Show success message
            showTemporaryMessage('Task completed! ✅');
        }
        
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this task?')) {
                const taskItem = e.target.closest('.task-item');
                taskItem.remove();
                showTemporaryMessage('Task deleted! 🗑️');
            }
        }
    });
}

function showTemporaryMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4da6ff;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-weight: bold;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}