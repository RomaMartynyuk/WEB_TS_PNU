"use strict";
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
function formatReadableDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) {
        parts.push(`${hours}г`);
    }
    if (minutes > 0) {
        parts.push(`${minutes}хв`);
    }
    if (seconds > 0 && hours === 0) {
        parts.push(`${seconds}с`);
    }
    return parts.length > 0 ? parts.join(' ') : '0с';
}
function formatDate(date) {
    return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
class TimerService {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.callbacks = [];
    }
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.intervalId = window.setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.notifyCallbacks();
            }, 1000);
        }
    }
    stop() {
        if (this.isRunning && this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            this.intervalId = null;
        }
    }
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.notifyCallbacks();
    }
    subscribe(callback) {
        this.callbacks.push(callback);
    }
    getTotalSeconds() {
        return Math.floor(this.elapsedTime / 1000);
    }
    notifyCallbacks() {
        const formattedTime = formatDuration(this.getTotalSeconds());
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}
class RestTimerService {
    constructor() {
        this.remaining = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.callbacks = [];
    }
    start(durationSeconds) {
        this.remaining = durationSeconds;
        this.isRunning = true;
        this.intervalId = window.setInterval(() => {
            this.remaining--;
            this.notifyCallbacks();
            if (this.remaining <= 0) {
                this.stop();
            }
        }, 1000);
        this.notifyCallbacks();
    }
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.remaining = 0;
    }
    pause() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }
    resume() {
        if (!this.isRunning && this.remaining > 0) {
            this.isRunning = true;
            this.intervalId = window.setInterval(() => {
                this.remaining--;
                this.notifyCallbacks();
                if (this.remaining <= 0) {
                    this.stop();
                }
            }, 1000);
        }
    }
    subscribe(callback) {
        this.callbacks.push(callback);
    }
    isActive() {
        return this.isRunning;
    }
    notifyCallbacks() {
        const minutes = Math.floor(this.remaining / 60);
        const seconds = this.remaining % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}
class ApiService {
    constructor() {
        this.workoutSessions = [];
        this.currentSession = null;
        this.storageKey = 'personalPlatzWorkouts';
        this.loadFromStorage();
    }
    createWorkoutSession(name) {
        const session = {
            id: generateId(),
            name: name,
            date: new Date(),
            exercises: [],
            duration: 0,
            isActive: true
        };
        this.currentSession = session;
        return session;
    }
    addExercise(name, sets, reps, weight) {
        if (!this.currentSession) {
            throw new Error('No active workout session');
        }
        const newExercise = {
            id: generateId(),
            name: name,
            sets: sets,
            reps: reps,
            weight: weight,
            record: 0,
            completed: false
        };
        this.currentSession.exercises.push(newExercise);
        return newExercise;
    }
    updateExercise(exerciseId, name, sets, reps, weight) {
        if (!this.currentSession)
            return null;
        const exerciseIndex = this.currentSession.exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex === -1)
            return null;
        this.currentSession.exercises[exerciseIndex].name = name;
        this.currentSession.exercises[exerciseIndex].sets = sets;
        this.currentSession.exercises[exerciseIndex].reps = reps;
        this.currentSession.exercises[exerciseIndex].weight = weight;
        return this.currentSession.exercises[exerciseIndex];
    }
    removeExercise(exerciseId) {
        if (!this.currentSession)
            return false;
        const initialLength = this.currentSession.exercises.length;
        this.currentSession.exercises = this.currentSession.exercises.filter(ex => ex.id !== exerciseId);
        return this.currentSession.exercises.length < initialLength;
    }
    finishWorkoutSession(duration) {
        if (!this.currentSession)
            return;
        this.currentSession.duration = duration;
        this.currentSession.isActive = false;
        this.workoutSessions.push(this.currentSession);
        this.saveToStorage();
        this.currentSession = null;
    }
    getCurrentSession() {
        return this.currentSession;
    }
    getWorkoutHistory() {
        return this.workoutSessions.filter(session => !session.isActive);
    }
    updateSessionName(name) {
        if (this.currentSession) {
            this.currentSession.name = name;
        }
    }
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.workoutSessions = parsed.map((session) => (Object.assign(Object.assign({}, session), { date: new Date(session.date) })));
            }
        }
        catch (error) {
            console.error('Error loading from storage:', error);
        }
    }
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.workoutSessions));
        }
        catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
}
let currentPage = 'home';
let apiService;
let workoutTimer;
let restTimer;
let currentEditingExercise = null;
function navigateTo(page) {
    const pages = ['homePage', 'workoutPage', 'historyPage'];
    pages.forEach(pageId => {
        const element = document.getElementById(pageId);
        if (element) {
            element.classList.add('hidden');
        }
    });
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        currentPage = page;
        updateActiveTab(page);
        updateFloatingElements(page);
    }
}
function updateActiveTab(page) {
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
    });
    let activeTabId = '';
    if (page === 'home')
        activeTabId = 'homeTabLink';
    else if (page === 'workout')
        activeTabId = 'workoutTabLink';
    else if (page === 'history')
        activeTabId = 'historyTabLink';
    const activeTab = document.getElementById(activeTabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}
function updateFloatingElements(page) {
    const floatingAddBtn = document.getElementById('floatingAddBtn');
    if (floatingAddBtn) {
        if (page === 'workout') {
            floatingAddBtn.classList.remove('hidden');
        }
        else {
            floatingAddBtn.classList.add('hidden');
        }
    }
}
function startNewWorkout() {
    const session = apiService.createWorkoutSession('Нове тренування');
    workoutTimer.reset();
    workoutTimer.start();
    navigateTo('workout');
    renderExercises();
    const sessionNameInput = document.getElementById('sessionName');
    if (sessionNameInput) {
        sessionNameInput.value = session.name;
    }
}
function finishWorkout() {
    const session = apiService.getCurrentSession();
    if (session) {
        if (confirm('Ви впевнені, що хочете завершити тренування?')) {
            workoutTimer.stop();
            const duration = workoutTimer.getTotalSeconds();
            apiService.finishWorkoutSession(duration);
            loadHistory();
            stopRestTimer();
            navigateTo('home');
        }
    }
}
function showExerciseModal(exercise) {
    currentEditingExercise = exercise || null;
    const modal = new window.bootstrap.Modal(document.getElementById('exerciseModal'));
    if (exercise) {
        const nameInput = document.getElementById('exerciseName');
        const setsInput = document.getElementById('exerciseSets');
        const repsInput = document.getElementById('exerciseReps');
        const weightInput = document.getElementById('exerciseWeight');
        if (nameInput)
            nameInput.value = exercise.name;
        if (setsInput)
            setsInput.value = exercise.sets.toString();
        if (repsInput)
            repsInput.value = exercise.reps.toString();
        if (weightInput)
            weightInput.value = exercise.weight.toString();
    }
    else {
        const form = document.getElementById('exerciseForm');
        if (form)
            form.reset();
    }
    modal.show();
}
function saveExercise() {
    const nameInput = document.getElementById('exerciseName');
    const setsInput = document.getElementById('exerciseSets');
    const repsInput = document.getElementById('exerciseReps');
    const weightInput = document.getElementById('exerciseWeight');
    if (!nameInput || !setsInput || !repsInput || !weightInput)
        return;
    const name = nameInput.value.trim();
    const sets = parseInt(setsInput.value) || 1;
    const reps = parseInt(repsInput.value) || 1;
    const weight = parseFloat(weightInput.value) || 0;
    if (!name) {
        alert('Будь ласка, введіть назву вправи');
        return;
    }
    try {
        if (currentEditingExercise) {
            apiService.updateExercise(currentEditingExercise.id, name, sets, reps, weight);
        }
        else {
            apiService.addExercise(name, sets, reps, weight);
        }
        renderExercises();
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('exerciseModal'));
        if (modal)
            modal.hide();
        currentEditingExercise = null;
    }
    catch (error) {
        console.error('Error saving exercise:', error);
        alert('Помилка збереження вправи');
    }
}
function renderExercises() {
    const exercisesList = document.getElementById('exercisesList');
    if (!exercisesList)
        return;
    exercisesList.innerHTML = '';
    const session = apiService.getCurrentSession();
    if (!session || session.exercises.length === 0) {
        exercisesList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-dumbbell fa-3x mb-3"></i>
                <p>Поки що немає вправ. Додайте першу вправу для початку тренування!</p>
            </div>
        `;
        return;
    }
    session.exercises.forEach((exercise) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'exercise-item p-3 mb-3';
        cardElement.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h5 class="mb-1">${exercise.name}</h5>
                    <div class="d-flex gap-3">
                        <span><i class="fas fa-dumbbell me-1"></i>${exercise.sets} підходи</span>
                        <span><i class="fas fa-repeat me-1"></i>${exercise.reps} повтори</span>
                        <span><i class="fas fa-weight-hanging me-1"></i>${exercise.weight} кг</span>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-center">
                        <button class="btn btn-sm btn-outline-success" onclick="startRestTimer()">
                            <i class="fas fa-clock"></i> Відпочинок
                        </button>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="editExercise('${exercise.id}')"><i class="fas fa-edit me-2"></i>Редагувати</a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteExercise('${exercise.id}')"><i class="fas fa-trash me-2"></i>Видалити</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        exercisesList.appendChild(cardElement);
    });
}
function editExercise(exerciseId) {
    const session = apiService.getCurrentSession();
    if (session) {
        const exercise = session.exercises.find(ex => ex.id === exerciseId);
        if (exercise) {
            showExerciseModal(exercise);
        }
    }
}
function deleteExercise(exerciseId) {
    if (confirm('Ви впевнені, що хочете видалити цю вправу?')) {
        apiService.removeExercise(exerciseId);
        renderExercises();
    }
}
function startRestTimer() {
    const restTimerElement = document.getElementById('restTimer');
    if (restTimerElement) {
        restTimerElement.classList.remove('hidden');
        restTimer.start(90);
        const pauseBtn = document.getElementById('pauseTimerBtn');
        const icon = (pauseBtn === null || pauseBtn === void 0 ? void 0 : pauseBtn.querySelector('i')) || null;
        if (icon) {
            icon.className = 'fas fa-pause';
        }
    }
}
function stopRestTimer() {
    restTimer.stop();
    const restTimerElement = document.getElementById('restTimer');
    if (restTimerElement) {
        restTimerElement.classList.add('hidden');
    }
}
function toggleRestTimer() {
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const icon = (pauseBtn === null || pauseBtn === void 0 ? void 0 : pauseBtn.querySelector('i')) || null;
    if (restTimer.isActive()) {
        restTimer.pause();
        if (icon) {
            icon.className = 'fas fa-play';
        }
    }
    else {
        restTimer.resume();
        if (icon) {
            icon.className = 'fas fa-pause';
        }
    }
}
function loadHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList)
        return;
    const workoutHistory = apiService.getWorkoutHistory();
    if (workoutHistory.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-history fa-3x mb-3"></i>
                <p>Історія тренувань поки що порожня. Завершіть перше тренування, щоб побачити його тут!</p>
            </div>
        `;
        return;
    }
    historyList.innerHTML = '';
    const sortedHistory = workoutHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
    sortedHistory.forEach((session) => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'exercise-item p-3 mb-3';
        const formattedDate = formatDate(session.date);
        const durationFormatted = formatReadableDuration(session.duration);
        sessionCard.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h5 class="mb-1">${session.name}</h5>
                    <small class="text-muted">${formattedDate}</small>
                </div>
                <div class="col-md-3">
                    <div class="text-center">
                        <span class="badge bg-primary">${session.exercises.length} вправ</span>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-end">
                        <span class="fw-bold">${durationFormatted}</span>
                    </div>
                </div>
            </div>
            ${session.exercises.length > 0 ? `
                <div class="mt-3">
                    <small class="text-muted">Вправи: ${session.exercises.map((ex) => ex.name).join(', ')}</small>
                </div>
            ` : ''}
        `;
        historyList.appendChild(sessionCard);
    });
}
function setupEventListeners() {
    const homeTabLink = document.getElementById('homeTabLink');
    const workoutTabLink = document.getElementById('workoutTabLink');
    const historyTabLink = document.getElementById('historyTabLink');
    const homeLink = document.getElementById('homeLink');
    homeTabLink === null || homeTabLink === void 0 ? void 0 : homeTabLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });
    workoutTabLink === null || workoutTabLink === void 0 ? void 0 : workoutTabLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('workout');
    });
    historyTabLink === null || historyTabLink === void 0 ? void 0 : historyTabLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('history');
    });
    homeLink === null || homeLink === void 0 ? void 0 : homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });
    const startWorkoutBtn = document.getElementById('startWorkoutBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    startWorkoutBtn === null || startWorkoutBtn === void 0 ? void 0 : startWorkoutBtn.addEventListener('click', startNewWorkout);
    viewHistoryBtn === null || viewHistoryBtn === void 0 ? void 0 : viewHistoryBtn.addEventListener('click', () => navigateTo('history'));
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    const floatingAddBtn = document.getElementById('floatingAddBtn');
    const finishWorkoutBtn = document.getElementById('finishWorkoutBtn');
    const sessionNameInput = document.getElementById('sessionName');
    addExerciseBtn === null || addExerciseBtn === void 0 ? void 0 : addExerciseBtn.addEventListener('click', () => showExerciseModal());
    floatingAddBtn === null || floatingAddBtn === void 0 ? void 0 : floatingAddBtn.addEventListener('click', () => showExerciseModal());
    finishWorkoutBtn === null || finishWorkoutBtn === void 0 ? void 0 : finishWorkoutBtn.addEventListener('click', finishWorkout);
    sessionNameInput === null || sessionNameInput === void 0 ? void 0 : sessionNameInput.addEventListener('blur', () => {
        if (sessionNameInput.value.trim()) {
            apiService.updateSessionName(sessionNameInput.value.trim());
        }
    });
    const saveExerciseBtn = document.getElementById('saveExerciseBtn');
    saveExerciseBtn === null || saveExerciseBtn === void 0 ? void 0 : saveExerciseBtn.addEventListener('click', saveExercise);
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const stopTimerBtn = document.getElementById('stopTimerBtn');
    pauseTimerBtn === null || pauseTimerBtn === void 0 ? void 0 : pauseTimerBtn.addEventListener('click', toggleRestTimer);
    stopTimerBtn === null || stopTimerBtn === void 0 ? void 0 : stopTimerBtn.addEventListener('click', stopRestTimer);
}
function setupTimers() {
    workoutTimer.subscribe((time) => {
        const timerDisplay = document.getElementById('workoutTimer');
        if (timerDisplay) {
            timerDisplay.textContent = time;
        }
    });
    restTimer.subscribe((time) => {
        const restTimerDisplay = document.getElementById('restTimerDisplay');
        if (restTimerDisplay) {
            restTimerDisplay.textContent = time;
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    try {
        apiService = new ApiService();
        workoutTimer = new TimerService();
        restTimer = new RestTimerService();
        setupEventListeners();
        setupTimers();
        loadHistory();
        console.log('Personal Platz app initialized successfully!');
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 1060; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            Personal Platz готовий до роботи!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    catch (error) {
        console.error('Error initializing Personal Platz app:', error);
        const errorNotification = document.createElement('div');
        errorNotification.className = 'alert alert-danger position-fixed';
        errorNotification.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 1060;';
        errorNotification.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            Помилка ініціалізації додатку. Перевірте консоль браузера.
        `;
        document.body.appendChild(errorNotification);
    }
});
