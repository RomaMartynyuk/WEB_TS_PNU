// Personal Platz - Головний файл додатку
// Ініціалізація та запуск всього додатку

import { ApiService } from './api.service.js';
import { TimerService, RestTimerService } from './timer.service.js';
import { NavigationService } from './navigation.service.js';
import { WorkoutController } from './workout.controller.js';
import { HistoryController } from './history.controller.js';
import { EventHandlers } from './event-handlers.js';

// Глобальні змінні для доступу з HTML onclick
let workoutController: WorkoutController;

class PersonalPlatzApp {
    private apiService!: ApiService;
    private workoutTimer!: TimerService;
    private restTimer!: RestTimerService;
    private navigationService!: NavigationService;
    private workoutController!: WorkoutController;
    private historyController!: HistoryController;
    private eventHandlers!: EventHandlers;

    constructor() {
        this.initializeServices();
        this.setupControllers();
        this.setupGlobalAccess();
    }

    private initializeServices(): void {
        this.apiService = new ApiService();
        this.workoutTimer = new TimerService();
        this.restTimer = new RestTimerService();
        this.navigationService = new NavigationService();
    }

    private setupControllers(): void {
        this.historyController = new HistoryController(this.apiService);
        
        this.workoutController = new WorkoutController(
            this.apiService,
            this.workoutTimer,
            this.restTimer,
            this.navigationService,
            this.historyController
        );

        this.workoutController.setHistoryController(this.historyController);

        this.eventHandlers = new EventHandlers(
            this.navigationService,
            this.workoutController,
            this.apiService
        );
    }

    private setupGlobalAccess(): void {
        // Експортуємо контролери в глобальну область для доступу з HTML onclick
        (window as any).workoutController = this.workoutController;
        (window as any).navigationService = this.navigationService;
        (window as any).historyController = this.historyController;
        
        // Встановлюємо глобальну змінну для зворотної сумісності
        workoutController = this.workoutController;
    }

    private setupTimers(): void {
        this.workoutTimer.subscribe((time: string) => {
            const timerDisplay: HTMLElement | null = document.getElementById('workoutTimer');
            if (timerDisplay) {
                timerDisplay.textContent = time;
            }
        });

        this.restTimer.subscribe((time: string) => {
            const restTimerDisplay: HTMLElement | null = document.getElementById('restTimerDisplay');
            if (restTimerDisplay) {
                restTimerDisplay.textContent = time;
            }
        });
    }

    public initialize(): void {
        try {
            this.eventHandlers.setupEventListeners();
            this.setupTimers();
            this.historyController.loadHistory();
            
            console.log('Personal Platz app initialized successfully!');
            this.showSuccessNotification();
            
        } catch (error) {
            console.error('Error initializing Personal Platz app:', error);
            this.showErrorNotification();
        }
    }

    private showSuccessNotification(): void {
        const notification: HTMLDivElement = document.createElement('div');
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

    private showErrorNotification(): void {
        const errorNotification: HTMLDivElement = document.createElement('div');
        errorNotification.className = 'alert alert-danger position-fixed';
        errorNotification.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 1060;';
        errorNotification.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            Помилка ініціалізації додатку. Перевірте консоль браузера.
        `;
        
        document.body.appendChild(errorNotification);
    }
}

// Запуск додатку при завантаженні DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new PersonalPlatzApp();
    app.initialize();
});

// Експорт для використання в HTML (зворотна сумісність)
export { workoutController };