// Personal Platz - TypeScript веб-додаток для тренувань
// Лабораторна робота №2 - Проектування веб-додатків TypeScript

// ===== ІНТЕРФЕЙСИ ТА ТИПИ =====

interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    record: number;
    completed: boolean;
}

interface WorkoutSession {
    id: string;
    name: string;
    date: Date;
    exercises: Exercise[];
    duration: number;
    isActive: boolean;
}

type PageType = 'home' | 'workout' | 'history';

// ===== УТИЛІТНІ ФУНКЦІЇ =====

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatDuration(totalSeconds: number): string {
    const hours: number = Math.floor(totalSeconds / 3600);
    const minutes: number = Math.floor((totalSeconds % 3600) / 60);
    const seconds: number = totalSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function formatReadableDuration(totalSeconds: number): string {
    const hours: number = Math.floor(totalSeconds / 3600);
    const minutes: number = Math.floor((totalSeconds % 3600) / 60);
    const seconds: number = totalSeconds % 60;

    const parts: string[] = [];
    
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

function formatDate(date: Date): string {
    return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===== СЕРВІСИ =====

class TimerService {
    private startTime: number = 0;
    private elapsedTime: number = 0;
    private isRunning: boolean = false;
    private intervalId: number | null = null;
    private callbacks: ((time: string) => void)[] = [];

    public start(): void {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.intervalId = window.setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.notifyCallbacks();
            }, 1000);
        }
    }

    public stop(): void {
        if (this.isRunning && this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            this.intervalId = null;
        }
    }

    public reset(): void {
        this.stop();
        this.elapsedTime = 0;
        this.notifyCallbacks();
    }

    public subscribe(callback: (time: string) => void): void {
        this.callbacks.push(callback);
    }

    public getTotalSeconds(): number {
        return Math.floor(this.elapsedTime / 1000);
    }

    private notifyCallbacks(): void {
        const formattedTime: string = formatDuration(this.getTotalSeconds());
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}

class RestTimerService {
    private remaining: number = 0;
    private isRunning: boolean = false;
    private intervalId: number | null = null;
    private callbacks: ((remaining: string) => void)[] = [];

    public start(durationSeconds: number): void {
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

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.remaining = 0;
    }

    public pause(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    public resume(): void {
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

    public subscribe(callback: (remaining: string) => void): void {
        this.callbacks.push(callback);
    }

    public isActive(): boolean {
        return this.isRunning;
    }

    private notifyCallbacks(): void {
        const minutes: number = Math.floor(this.remaining / 60);
        const seconds: number = this.remaining % 60;
        const formattedTime: string = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}

class ApiService {
    private workoutSessions: WorkoutSession[] = [];
    private currentSession: WorkoutSession | null = null;
    private readonly storageKey: string = 'personalPlatzWorkouts';

    constructor() {
        this.loadFromStorage();
    }

    public createWorkoutSession(name: string): WorkoutSession {
        const session: WorkoutSession = {
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

    public addExercise(name: string, sets: number, reps: number, weight: number): Exercise {
        if (!this.currentSession) {
            throw new Error('No active workout session');
        }

        const newExercise: Exercise = {
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

    public updateExercise(exerciseId: string, name: string, sets: number, reps: number, weight: number): Exercise | null {
        if (!this.currentSession) return null;

        const exerciseIndex: number = this.currentSession.exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex === -1) return null;

        this.currentSession.exercises[exerciseIndex].name = name;
        this.currentSession.exercises[exerciseIndex].sets = sets;
        this.currentSession.exercises[exerciseIndex].reps = reps;
        this.currentSession.exercises[exerciseIndex].weight = weight;

        return this.currentSession.exercises[exerciseIndex];
    }

    public removeExercise(exerciseId: string): boolean {
        if (!this.currentSession) return false;

        const initialLength: number = this.currentSession.exercises.length;
        this.currentSession.exercises = this.currentSession.exercises.filter(ex => ex.id !== exerciseId);
        
        return this.currentSession.exercises.length < initialLength;
    }

    public finishWorkoutSession(duration: number): void {
        if (!this.currentSession) return;

        this.currentSession.duration = duration;
        this.currentSession.isActive = false;
        this.workoutSessions.push(this.currentSession);
        this.saveToStorage();
        this.currentSession = null;
    }

    public getCurrentSession(): WorkoutSession | null {
        return this.currentSession;
    }

    public getWorkoutHistory(): WorkoutSession[] {
        return this.workoutSessions.filter(session => !session.isActive);
    }

    public updateSessionName(name: string): void {
        if (this.currentSession) {
            this.currentSession.name = name;
        }
    }

    private loadFromStorage(): void {
        try {
            const stored: string | null = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.workoutSessions = parsed.map((session: any) => ({
                    ...session,
                    date: new Date(session.date)
                }));
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.workoutSessions));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
}

// ===== ГЛОБАЛЬНІ ЗМІННІ =====

let currentPage: PageType = 'home';
let apiService: ApiService;
let workoutTimer: TimerService;
let restTimer: RestTimerService;
let currentEditingExercise: Exercise | null = null;

// ===== ФУНКЦІЇ НАВІГАЦІЇ =====

function navigateTo(page: PageType): void {
    // Ховаємо всі сторінки
    const pages: string[] = ['homePage', 'workoutPage', 'historyPage'];
    pages.forEach(pageId => {
        const element: HTMLElement | null = document.getElementById(pageId);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Показуємо обрану сторінку
    const targetPage: HTMLElement | null = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        currentPage = page;
        updateActiveTab(page);
        updateFloatingElements(page);
    }
}

function updateActiveTab(page: PageType): void {
    // Видаляємо активний клас з усіх табів
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.classList.remove('active');
    });

    // Додаємо активний клас до поточного табу
    let activeTabId: string = '';
    if (page === 'home') activeTabId = 'homeTabLink';
    else if (page === 'workout') activeTabId = 'workoutTabLink';
    else if (page === 'history') activeTabId = 'historyTabLink';

    const activeTab: HTMLElement | null = document.getElementById(activeTabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

function updateFloatingElements(page: PageType): void {
    const floatingAddBtn: HTMLElement | null = document.getElementById('floatingAddBtn');
    
    if (floatingAddBtn) {
        if (page === 'workout') {
            floatingAddBtn.classList.remove('hidden');
        } else {
            floatingAddBtn.classList.add('hidden');
        }
    }
}

// ===== ФУНКЦІЇ ТРЕНУВАННЯ =====

function startNewWorkout(): void {
    const session: WorkoutSession = apiService.createWorkoutSession('Нове тренування');
    workoutTimer.reset();
    workoutTimer.start();
    navigateTo('workout');
    renderExercises();
    
    const sessionNameInput: HTMLInputElement | null = document.getElementById('sessionName') as HTMLInputElement;
    if (sessionNameInput) {
        sessionNameInput.value = session.name;
    }
}

function finishWorkout(): void {
    const session: WorkoutSession | null = apiService.getCurrentSession();
    if (session) {
        if (confirm('Ви впевнені, що хочете завершити тренування?')) {
            workoutTimer.stop();
            const duration: number = workoutTimer.getTotalSeconds();
            apiService.finishWorkoutSession(duration);
            loadHistory();
            stopRestTimer();
            navigateTo('home');
        }
    }
}

function showExerciseModal(exercise?: Exercise): void {
    currentEditingExercise = exercise || null;
    
    const modal = new (window as any).bootstrap.Modal(document.getElementById('exerciseModal'));
    
    if (exercise) {
        const nameInput: HTMLInputElement | null = document.getElementById('exerciseName') as HTMLInputElement;
        const setsInput: HTMLInputElement | null = document.getElementById('exerciseSets') as HTMLInputElement;
        const repsInput: HTMLInputElement | null = document.getElementById('exerciseReps') as HTMLInputElement;
        const weightInput: HTMLInputElement | null = document.getElementById('exerciseWeight') as HTMLInputElement;

        if (nameInput) nameInput.value = exercise.name;
        if (setsInput) setsInput.value = exercise.sets.toString();
        if (repsInput) repsInput.value = exercise.reps.toString();
        if (weightInput) weightInput.value = exercise.weight.toString();
    } else {
        const form: HTMLFormElement | null = document.getElementById('exerciseForm') as HTMLFormElement;
        if (form) form.reset();
    }
    
    modal.show();
}

function saveExercise(): void {
    const nameInput: HTMLInputElement | null = document.getElementById('exerciseName') as HTMLInputElement;
    const setsInput: HTMLInputElement | null = document.getElementById('exerciseSets') as HTMLInputElement;
    const repsInput: HTMLInputElement | null = document.getElementById('exerciseReps') as HTMLInputElement;
    const weightInput: HTMLInputElement | null = document.getElementById('exerciseWeight') as HTMLInputElement;

    if (!nameInput || !setsInput || !repsInput || !weightInput) return;

    const name: string = nameInput.value.trim();
    const sets: number = parseInt(setsInput.value) || 1;
    const reps: number = parseInt(repsInput.value) || 1;
    const weight: number = parseFloat(weightInput.value) || 0;

    if (!name) {
        alert('Будь ласка, введіть назву вправи');
        return;
    }

    try {
        if (currentEditingExercise) {
            apiService.updateExercise(currentEditingExercise.id, name, sets, reps, weight);
        } else {
            apiService.addExercise(name, sets, reps, weight);
        }

        renderExercises();
        
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('exerciseModal'));
        if (modal) modal.hide();
        
        currentEditingExercise = null;
    } catch (error) {
        console.error('Error saving exercise:', error);
        alert('Помилка збереження вправи');
    }
}

function renderExercises(): void {
    const exercisesList: HTMLElement | null = document.getElementById('exercisesList');
    if (!exercisesList) return;

    exercisesList.innerHTML = '';

    const session: WorkoutSession | null = apiService.getCurrentSession();
    if (!session || session.exercises.length === 0) {
        exercisesList.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-dumbbell fa-3x mb-3"></i>
                <p>Поки що немає вправ. Додайте першу вправу для початку тренування!</p>
            </div>
        `;
        return;
    }

    session.exercises.forEach((exercise: Exercise) => {
        const cardElement: HTMLDivElement = document.createElement('div');
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

function editExercise(exerciseId: string): void {
    const session: WorkoutSession | null = apiService.getCurrentSession();
    if (session) {
        const exercise: Exercise | undefined = session.exercises.find(ex => ex.id === exerciseId);
        if (exercise) {
            showExerciseModal(exercise);
        }
    }
}

function deleteExercise(exerciseId: string): void {
    if (confirm('Ви впевнені, що хочете видалити цю вправу?')) {
        apiService.removeExercise(exerciseId);
        renderExercises();
    }
}

// ===== ФУНКЦІЇ ТАЙМЕРА ВІДПОЧИНКУ =====

function startRestTimer(): void {
    const restTimerElement: HTMLElement | null = document.getElementById('restTimer');
    if (restTimerElement) {
        restTimerElement.classList.remove('hidden');
        restTimer.start(90); // 90 секунд за замовчуванням
        
        const pauseBtn: HTMLElement | null = document.getElementById('pauseTimerBtn');
        const icon: HTMLElement | null = pauseBtn?.querySelector('i') || null;
        if (icon) {
            icon.className = 'fas fa-pause';
        }
    }
}

function stopRestTimer(): void {
    restTimer.stop();
    const restTimerElement: HTMLElement | null = document.getElementById('restTimer');
    if (restTimerElement) {
        restTimerElement.classList.add('hidden');
    }
}

function toggleRestTimer(): void {
    const pauseBtn: HTMLElement | null = document.getElementById('pauseTimerBtn');
    const icon: HTMLElement | null = pauseBtn?.querySelector('i') || null;
    
    if (restTimer.isActive()) {
        restTimer.pause();
        if (icon) {
            icon.className = 'fas fa-play';
        }
    } else {
        restTimer.resume();
        if (icon) {
            icon.className = 'fas fa-pause';
        }
    }
}

// ===== ФУНКЦІЇ ІСТОРІЇ =====

function loadHistory(): void {
    const historyList: HTMLElement | null = document.getElementById('historyList');
    if (!historyList) return;

    const workoutHistory: WorkoutSession[] = apiService.getWorkoutHistory();
    
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
    
    const sortedHistory: WorkoutSession[] = workoutHistory.sort((a: WorkoutSession, b: WorkoutSession) => 
        b.date.getTime() - a.date.getTime()
    );
    
    sortedHistory.forEach((session: WorkoutSession) => {
        const sessionCard: HTMLDivElement = document.createElement('div');
        sessionCard.className = 'exercise-item p-3 mb-3';
        
        const formattedDate: string = formatDate(session.date);
        const durationFormatted: string = formatReadableDuration(session.duration);
        
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
                    <small class="text-muted">Вправи: ${session.exercises.map((ex: Exercise) => ex.name).join(', ')}</small>
                </div>
            ` : ''}
        `;
        
        historyList.appendChild(sessionCard);
    });
}

// ===== ІНІЦІАЛІЗАЦІЯ =====

function setupEventListeners(): void {
    // Навігація
    const homeTabLink: HTMLElement | null = document.getElementById('homeTabLink');
    const workoutTabLink: HTMLElement | null = document.getElementById('workoutTabLink');
    const historyTabLink: HTMLElement | null = document.getElementById('historyTabLink');
    const homeLink: HTMLElement | null = document.getElementById('homeLink');

    homeTabLink?.addEventListener('click', (e: Event) => {
        e.preventDefault();
        navigateTo('home');
    });

    workoutTabLink?.addEventListener('click', (e: Event) => {
        e.preventDefault();
        navigateTo('workout');
    });

    historyTabLink?.addEventListener('click', (e: Event) => {
        e.preventDefault();
        navigateTo('history');
    });

    homeLink?.addEventListener('click', (e: Event) => {
        e.preventDefault();
        navigateTo('home');
    });

    // Головна сторінка
    const startWorkoutBtn: HTMLElement | null = document.getElementById('startWorkoutBtn');
    const viewHistoryBtn: HTMLElement | null = document.getElementById('viewHistoryBtn');

    startWorkoutBtn?.addEventListener('click', startNewWorkout);
    viewHistoryBtn?.addEventListener('click', () => navigateTo('history'));

    // Сторінка тренування
    const addExerciseBtn: HTMLElement | null = document.getElementById('addExerciseBtn');
    const floatingAddBtn: HTMLElement | null = document.getElementById('floatingAddBtn');
    const finishWorkoutBtn: HTMLElement | null = document.getElementById('finishWorkoutBtn');
    const sessionNameInput: HTMLInputElement | null = document.getElementById('sessionName') as HTMLInputElement;

    addExerciseBtn?.addEventListener('click', () => showExerciseModal());
    floatingAddBtn?.addEventListener('click', () => showExerciseModal());
    finishWorkoutBtn?.addEventListener('click', finishWorkout);

    sessionNameInput?.addEventListener('blur', () => {
        if (sessionNameInput.value.trim()) {
            apiService.updateSessionName(sessionNameInput.value.trim());
        }
    });

    // Модальне вікно
    const saveExerciseBtn: HTMLElement | null = document.getElementById('saveExerciseBtn');
    saveExerciseBtn?.addEventListener('click', saveExercise);

    // Таймер відпочинку
    const pauseTimerBtn: HTMLElement | null = document.getElementById('pauseTimerBtn');
    const stopTimerBtn: HTMLElement | null = document.getElementById('stopTimerBtn');

    pauseTimerBtn?.addEventListener('click', toggleRestTimer);
    stopTimerBtn?.addEventListener('click', stopRestTimer);
}

function setupTimers(): void {
    workoutTimer.subscribe((time: string) => {
        const timerDisplay: HTMLElement | null = document.getElementById('workoutTimer');
        if (timerDisplay) {
            timerDisplay.textContent = time;
        }
    });

    restTimer.subscribe((time: string) => {
        const restTimerDisplay: HTMLElement | null = document.getElementById('restTimerDisplay');
        if (restTimerDisplay) {
            restTimerDisplay.textContent = time;
        }
    });
}

// ===== ЗАПУСК ДОДАТКУ =====

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Ініціалізація сервісів
        apiService = new ApiService();
        workoutTimer = new TimerService();
        restTimer = new RestTimerService();
        
        // Налаштування
        setupEventListeners();
        setupTimers();
        loadHistory();
        
        console.log('Personal Platz app initialized successfully!');
        
        // Показуємо повідомлення про готовність
        const notification: HTMLDivElement = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 1060; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            Personal Platz готовий до роботи!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматично ховаємо повідомлення через 3 секунди
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error initializing Personal Platz app:', error);
        
        const errorNotification: HTMLDivElement = document.createElement('div');
        errorNotification.className = 'alert alert-danger position-fixed';
        errorNotification.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 1060;';
        errorNotification.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            Помилка ініціалізації додатку. Перевірте консоль браузера.
        `;
        
        document.body.appendChild(errorNotification);
    }
});