
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = 'all';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function cleanupTasks() {
    const now = Date.now();
    const before = tasks.length;
    tasks = tasks.filter(t => {
        // keep if not completed, or completed but not older than 24h
        if (!t || !t.completed) return true;
        if (!t.completedAt) return true;
        return (now - t.completedAt) < MS_IN_DAY;
    });
    if (tasks.length !== before) saveTasks();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks(filter = currentFilter) {
    cleanupTasks();
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.dataset.index = index;
        li.style.display = "flex";

        if (task.completed) li.classList.add("completed");

        const span = document.createElement("span");
        span.innerText = task.text;
        span.style.flex = "1";

        const delBtn = document.createElement("button");
        delBtn.innerText = "❌";
        delBtn.title = "Delete task";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            tasks.splice(index, 1);
            saveTasks();
            renderTasks(filter);
        };

        li.appendChild(span);
        li.appendChild(delBtn);

        li.onclick = () => {
            // Once a task is marked completed, do not allow toggling it back to pending.
            if (tasks[index].completed) return;
            tasks[index].completed = true;
            tasks[index].completedAt = Date.now();
            saveTasks();
            renderTasks(filter);
        };

        // Apply filter visibility
        if (filter === 'all') {
            // show
        } else if (filter === 'done' && !task.completed) {
            li.style.display = 'none';
        } else if (filter === 'pending' && task.completed) {
            li.style.display = 'none';
        }

        list.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById("taskInput");
    const taskText = input.value.trim();

    if (!taskText) {
        alert("Enter a task");
        return;
    }

    tasks.push({ text: taskText, completed: false, createdAt: Date.now(), completedAt: null });
    saveTasks();
    renderTasks();
    input.value = "";
}

function filterTasks(type) {
    currentFilter = type;
    renderTasks(type);
}

// Initial render on load
renderTasks();

// Periodically cleanup completed tasks older than 24 hours (runs every hour)
setInterval(() => {
    cleanupTasks();
    // re-render to reflect removals if any
    renderTasks();
}, 60 * 60 * 1000);

