// Personal Platz - Обробники подій
// Налаштування всіх слухачів подій DOM з підтримкою розрахунку об'єму

import { NavigationService } from './navigation.service.js';
import { WorkoutController } from './workout.controller.js';
import { ApiService } from './api.service.js';
import { calculateExerciseVolume, formatVolume } from './utils.js';

export class EventHandlers {
    constructor(
        private navigationService: NavigationService,
        private workoutController: WorkoutController,
        private apiService: ApiService
    ) {}

    public setupEventListeners(): void {
        this.setupNavigationListeners();
        this.setupHomePageListeners();
        this.setupWorkoutPageListeners();
        this.setupModalListeners();
        this.setupTimerListeners();
        this.setupVolumeCalculation();
    }

    private setupNavigationListeners(): void {
        const homeTabLink: HTMLElement | null = document.getElementById('homeTabLink');
        const workoutTabLink: HTMLElement | null = document.getElementById('workoutTabLink');
        const historyTabLink: HTMLElement | null = document.getElementById('historyTabLink');
        const homeLink: HTMLElement | null = document.getElementById('homeLink');

        homeTabLink?.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.navigationService.navigateTo('home');
        });

        workoutTabLink?.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.navigationService.navigateTo('workout');
        });

        historyTabLink?.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.navigationService.navigateTo('history');
        });

        homeLink?.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.navigationService.navigateTo('home');
        });
    }

    private setupHomePageListeners(): void {
        const startWorkoutBtn: HTMLElement | null = document.getElementById('startWorkoutBtn');
        const viewHistoryBtn: HTMLElement | null = document.getElementById('viewHistoryBtn');

        startWorkoutBtn?.addEventListener('click', () => {
            this.workoutController.startNewWorkout();
        });

        viewHistoryBtn?.addEventListener('click', () => {
            this.navigationService.navigateTo('history');
        });
    }

    private setupWorkoutPageListeners(): void {
        const addExerciseBtn: HTMLElement | null = document.getElementById('addExerciseBtn');
        const floatingAddBtn: HTMLElement | null = document.getElementById('floatingAddBtn');
        const finishWorkoutBtn: HTMLElement | null = document.getElementById('finishWorkoutBtn');
        const sessionNameInput: HTMLInputElement | null = document.getElementById('sessionName') as HTMLInputElement;

        addExerciseBtn?.addEventListener('click', () => {
            this.workoutController.showExerciseModal();
        });

        floatingAddBtn?.addEventListener('click', () => {
            this.workoutController.showExerciseModal();
        });

        finishWorkoutBtn?.addEventListener('click', () => {
            this.workoutController.finishWorkout();
        });

        sessionNameInput?.addEventListener('blur', () => {
            if (sessionNameInput.value.trim()) {
                this.apiService.updateSessionName(sessionNameInput.value.trim());
            }
        });
    }

    private setupModalListeners(): void {
        const saveExerciseBtn: HTMLElement | null = document.getElementById('saveExerciseBtn');
        
        saveExerciseBtn?.addEventListener('click', () => {
            this.workoutController.saveExercise();
        });

        // Додаємо слухач для показу/приховування модального вікна
        const exerciseModal: HTMLElement | null = document.getElementById('exerciseModal');
        exerciseModal?.addEventListener('shown.bs.modal', () => {
            this.updateCalculatedVolume();
        });
    }

    private setupTimerListeners(): void {
        const pauseTimerBtn: HTMLElement | null = document.getElementById('pauseTimerBtn');
        const stopTimerBtn: HTMLElement | null = document.getElementById('stopTimerBtn');

        pauseTimerBtn?.addEventListener('click', () => {
            this.workoutController.toggleRestTimer();
        });

        stopTimerBtn?.addEventListener('click', () => {
            this.workoutController.stopRestTimer();
        });
    }

    private setupVolumeCalculation(): void {
        const setsInput: HTMLInputElement | null = document.getElementById('exerciseSets') as HTMLInputElement;
        const repsInput: HTMLInputElement | null = document.getElementById('exerciseReps') as HTMLInputElement;
        const weightInput: HTMLInputElement | null = document.getElementById('exerciseWeight') as HTMLInputElement;

        [setsInput, repsInput, weightInput].forEach(input => {
            input?.addEventListener('input', () => {
                this.updateCalculatedVolume();
            });
        });
    }

    private updateCalculatedVolume(): void {
        const setsInput: HTMLInputElement | null = document.getElementById('exerciseSets') as HTMLInputElement;
        const repsInput: HTMLInputElement | null = document.getElementById('exerciseReps') as HTMLInputElement;
        const weightInput: HTMLInputElement | null = document.getElementById('exerciseWeight') as HTMLInputElement;
        const calculatedVolumeElement: HTMLElement | null = document.getElementById('calculatedVolume');

        if (!setsInput || !repsInput || !weightInput || !calculatedVolumeElement) return;

        const sets: number = parseInt(setsInput.value) || 0;
        const reps: number = parseInt(repsInput.value) || 0;
        const weight: number = parseFloat(weightInput.value) || 0;

        const volume: number = calculateExerciseVolume(sets, reps, weight);
        calculatedVolumeElement.textContent = formatVolume(volume);

        // Додаємо анімацію для зміни
        calculatedVolumeElement.classList.remove('volume-animated');
        setTimeout(() => {
            calculatedVolumeElement.classList.add('volume-animated');
        }, 10);
    }
}