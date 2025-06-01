import { calculateExerciseVolume, formatVolume } from './utils.js';
export class EventHandlers {
    constructor(navigationService, workoutController, apiService) {
        this.navigationService = navigationService;
        this.workoutController = workoutController;
        this.apiService = apiService;
    }
    setupEventListeners() {
        this.setupNavigationListeners();
        this.setupHomePageListeners();
        this.setupWorkoutPageListeners();
        this.setupModalListeners();
        this.setupTimerListeners();
        this.setupVolumeCalculation();
    }
    setupNavigationListeners() {
        const homeTabLink = document.getElementById('homeTabLink');
        const workoutTabLink = document.getElementById('workoutTabLink');
        const historyTabLink = document.getElementById('historyTabLink');
        const homeLink = document.getElementById('homeLink');
        homeTabLink === null || homeTabLink === void 0 ? void 0 : homeTabLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigationService.navigateTo('home');
        });
        workoutTabLink === null || workoutTabLink === void 0 ? void 0 : workoutTabLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigationService.navigateTo('workout');
        });
        historyTabLink === null || historyTabLink === void 0 ? void 0 : historyTabLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigationService.navigateTo('history');
        });
        homeLink === null || homeLink === void 0 ? void 0 : homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigationService.navigateTo('home');
        });
    }
    setupHomePageListeners() {
        const startWorkoutBtn = document.getElementById('startWorkoutBtn');
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        startWorkoutBtn === null || startWorkoutBtn === void 0 ? void 0 : startWorkoutBtn.addEventListener('click', () => {
            this.workoutController.startNewWorkout();
        });
        viewHistoryBtn === null || viewHistoryBtn === void 0 ? void 0 : viewHistoryBtn.addEventListener('click', () => {
            this.navigationService.navigateTo('history');
        });
    }
    setupWorkoutPageListeners() {
        const addExerciseBtn = document.getElementById('addExerciseBtn');
        const floatingAddBtn = document.getElementById('floatingAddBtn');
        const finishWorkoutBtn = document.getElementById('finishWorkoutBtn');
        const sessionNameInput = document.getElementById('sessionName');
        addExerciseBtn === null || addExerciseBtn === void 0 ? void 0 : addExerciseBtn.addEventListener('click', () => {
            this.workoutController.showExerciseModal();
        });
        floatingAddBtn === null || floatingAddBtn === void 0 ? void 0 : floatingAddBtn.addEventListener('click', () => {
            this.workoutController.showExerciseModal();
        });
        finishWorkoutBtn === null || finishWorkoutBtn === void 0 ? void 0 : finishWorkoutBtn.addEventListener('click', () => {
            this.workoutController.finishWorkout();
        });
        sessionNameInput === null || sessionNameInput === void 0 ? void 0 : sessionNameInput.addEventListener('blur', () => {
            if (sessionNameInput.value.trim()) {
                this.apiService.updateSessionName(sessionNameInput.value.trim());
            }
        });
    }
    setupModalListeners() {
        const saveExerciseBtn = document.getElementById('saveExerciseBtn');
        saveExerciseBtn === null || saveExerciseBtn === void 0 ? void 0 : saveExerciseBtn.addEventListener('click', () => {
            this.workoutController.saveExercise();
        });
        const exerciseModal = document.getElementById('exerciseModal');
        exerciseModal === null || exerciseModal === void 0 ? void 0 : exerciseModal.addEventListener('shown.bs.modal', () => {
            this.updateCalculatedVolume();
        });
    }
    setupTimerListeners() {
        const pauseTimerBtn = document.getElementById('pauseTimerBtn');
        const stopTimerBtn = document.getElementById('stopTimerBtn');
        pauseTimerBtn === null || pauseTimerBtn === void 0 ? void 0 : pauseTimerBtn.addEventListener('click', () => {
            this.workoutController.toggleRestTimer();
        });
        stopTimerBtn === null || stopTimerBtn === void 0 ? void 0 : stopTimerBtn.addEventListener('click', () => {
            this.workoutController.stopRestTimer();
        });
    }
    setupVolumeCalculation() {
        const setsInput = document.getElementById('exerciseSets');
        const repsInput = document.getElementById('exerciseReps');
        const weightInput = document.getElementById('exerciseWeight');
        [setsInput, repsInput, weightInput].forEach(input => {
            input === null || input === void 0 ? void 0 : input.addEventListener('input', () => {
                this.updateCalculatedVolume();
            });
        });
    }
    updateCalculatedVolume() {
        const setsInput = document.getElementById('exerciseSets');
        const repsInput = document.getElementById('exerciseReps');
        const weightInput = document.getElementById('exerciseWeight');
        const calculatedVolumeElement = document.getElementById('calculatedVolume');
        if (!setsInput || !repsInput || !weightInput || !calculatedVolumeElement)
            return;
        const sets = parseInt(setsInput.value) || 0;
        const reps = parseInt(repsInput.value) || 0;
        const weight = parseFloat(weightInput.value) || 0;
        const volume = calculateExerciseVolume(sets, reps, weight);
        calculatedVolumeElement.textContent = formatVolume(volume);
        calculatedVolumeElement.classList.remove('volume-animated');
        setTimeout(() => {
            calculatedVolumeElement.classList.add('volume-animated');
        }, 10);
    }
}
