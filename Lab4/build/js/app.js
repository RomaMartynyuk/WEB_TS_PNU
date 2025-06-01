import { ApiService } from './api.service.js';
import { TimerService, RestTimerService } from './timer.service.js';
import { NavigationService } from './navigation.service.js';
import { WorkoutController } from './workout.controller.js';
import { HistoryController } from './history.controller.js';
import { EventHandlers } from './event-handlers.js';
let workoutController;
class PersonalPlatzApp {
    constructor() {
        this.initializeServices();
        this.setupControllers();
        this.setupGlobalAccess();
    }
    initializeServices() {
        this.apiService = new ApiService();
        this.workoutTimer = new TimerService();
        this.restTimer = new RestTimerService();
        this.navigationService = new NavigationService();
    }
    setupControllers() {
        this.historyController = new HistoryController(this.apiService);
        this.workoutController = new WorkoutController(this.apiService, this.workoutTimer, this.restTimer, this.navigationService, this.historyController);
        this.workoutController.setHistoryController(this.historyController);
        this.eventHandlers = new EventHandlers(this.navigationService, this.workoutController, this.apiService);
    }
    setupGlobalAccess() {
        window.workoutController = this.workoutController;
        window.navigationService = this.navigationService;
        window.historyController = this.historyController;
        workoutController = this.workoutController;
    }
    setupTimers() {
        this.workoutTimer.subscribe((time) => {
            const timerDisplay = document.getElementById('workoutTimer');
            if (timerDisplay) {
                timerDisplay.textContent = time;
            }
        });
        this.restTimer.subscribe((time) => {
            const restTimerDisplay = document.getElementById('restTimerDisplay');
            if (restTimerDisplay) {
                restTimerDisplay.textContent = time;
            }
        });
    }
    initialize() {
        try {
            this.eventHandlers.setupEventListeners();
            this.setupTimers();
            this.historyController.loadHistory();
            console.log('Personal Platz app initialized successfully!');
            this.showSuccessNotification();
        }
        catch (error) {
            console.error('Error initializing Personal Platz app:', error);
            this.showErrorNotification();
        }
    }
    showSuccessNotification() {
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
    showErrorNotification() {
        const errorNotification = document.createElement('div');
        errorNotification.className = 'alert alert-danger position-fixed';
        errorNotification.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 1060;';
        errorNotification.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            Помилка ініціалізації додатку. Перевірте консоль браузера.
        `;
        document.body.appendChild(errorNotification);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const app = new PersonalPlatzApp();
    app.initialize();
});
export { workoutController };
