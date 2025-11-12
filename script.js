// Data storage
let schedules = JSON.parse(localStorage.getItem('schedules')) || {
    senin: [],
    selasa: [],
    rabu: [],
    kamis: [],
    jumat: [],
    sabtu: []
};

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let notes = localStorage.getItem('notes') || '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    setCurrentDay();
    loadSchedule();
    loadTasks();
    loadNotes();
    
    // Auto-save notes
    document.getElementById('noteArea').addEventListener('input', debounce(saveNote, 1000));
});

// Update tanggal
function updateDate() {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const now = new Date();
    const dateString = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    
    document.getElementById('dateDisplay').textContent = dateString;
}

// Set hari ini
function setCurrentDay() {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const today = days[new Date().getDay()];
    
    const daySelect = document.getElementById('daySelect');
    if (today !== 'minggu') {
        daySelect.value = today;
    }
    
    daySelect.addEventListener('change', loadSchedule);
}

// Load jadwal
function loadSchedule() {
    const day = document.getElementById('daySelect').value;
    const scheduleList = document.getElementById('scheduleList');
    
    const daySchedules = schedules[day] || [];
    
    if (daySchedules.length === 0) {
        scheduleList.innerHTML = '<p style="text-align:center;color:#999;">Belum ada jadwal</p>';
        return;
    }
    
    // Sort by time
    daySchedules.sort((a, b) => a.time.localeCompare(b.time));
    
    scheduleList.innerHTML = daySchedules.map((item, index) => `
        <div class="schedule-item">
            <div>
                <span class="schedule-time">${item.time}</span>
                <span class="schedule-subject">${item.subject}</span>
                ${item.teacher ? `<div class="schedule-teacher">👨‍🏫 ${item.teacher}</div>` : ''}
            </div>
            <button class="btn-delete" onclick="deleteSchedule(${index})">🗑️</button>
        </div>
    `).join('');
}

// Modal functions
function addSchedule() {
    document.getElementById('scheduleModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('scheduleModal').style.display = 'none';
    document.getElementById('scheduleTime').value = '';
    document.getElementById('scheduleSubject').value = '';
    document.getElementById('scheduleTeacher').value = '';
}

function saveSchedule() {
    const day = document.getElementById('daySelect').value;
    const time = document.getElementById('scheduleTime').value;
    const subject = document.getElementById('scheduleSubject').value;
    const teacher = document.getElementById('scheduleTeacher').value;
    
    if (!time || !subject) {
        alert('Waktu dan mata pelajaran harus diisi!');
        return;
    }
    
    schedules[day].push({ time, subject, teacher });
    localStorage.setItem('schedules', JSON.stringify(schedules));
    
    loadSchedule();
    closeModal();
}

function deleteSchedule(index) {
    const day = document.getElementById('daySelect').value;
    schedules[day].splice(index, 1);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    loadSchedule();
}

// Tasks functions
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskDeadline = document.getElementById('taskDeadline');
    
    const taskText = taskInput.value.trim();
    const deadline = taskDeadline.value;
    
    if (!taskText) {
        alert('Tugas tidak boleh kosong!');
        return;
    }
    
    tasks.push({
        id: Date.now(),
        text: taskText,
        deadline: deadline,
        completed: false
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskInput.value = '';
    taskDeadline.value = '';
    
    loadTasks();
}

function loadTasks() {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align:center;color:#999;">Belum ada tugas</p>';
        return;
    }
    
    // Sort by deadline
    tasks.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <div class="task-content">
                <div>${task.text}</div>
                ${task.deadline ? `<div class="task-deadline">⏰ ${formatDate(task.deadline)}</div>` : ''}
            </div>
            <button class="btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
        </div>
    `).join('');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Notes functions
function saveNote() {
    const noteArea = document.getElementById('noteArea');
    localStorage.setItem('notes', noteArea.value);
}

function loadNotes() {
    document.getElementById('noteArea').value = notes;
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Lewat deadline!';
    if (diffDays === 0) return 'Hari ini!';
    if (diffDays === 1) return 'Besok';
    
    return `${diffDays} hari lagi`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('scheduleModal');
    if (event.target === modal) {
        closeModal();
    }
}