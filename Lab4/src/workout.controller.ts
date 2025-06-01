// Personal Platz - Контролер тренувань
// Управління логікою тренувань та вправ

import { Exercise, WorkoutSession } from './types.js';
import { ApiService } from './api.service.js';
import { TimerService, RestTimerService } from './timer.service.js';
import { NavigationService } from './navigation.service.js';
import { formatVolume } from './utils.js';

export class WorkoutController {
    private currentEditingExercise: Exercise | null = null;

    constructor(
        private apiService: ApiService,
        private workoutTimer: TimerService,
        private restTimer: RestTimerService,
        private navigationService: NavigationService,
        private historyController: any // Буде встановлено пізніше
    ) {}

    public setHistoryController(historyController: any): void {
        this.historyController = historyController;
    }

    public startNewWorkout(): void {
        const session: WorkoutSession = this.apiService.createWorkoutSession('Нове тренування');
        this.workoutTimer.reset();
        this.workoutTimer.start();
        this.navigationService.navigateTo('workout');
        this.renderExercises();
        this.updateVolumeDisplay();
        
        const sessionNameInput: HTMLInputElement | null = document.getElementById('sessionName') as HTMLInputElement;
        if (sessionNameInput) {
            sessionNameInput.value = session.name;
        }
    }

    public finishWorkout(): void {
        const session: WorkoutSession | null = this.apiService.getCurrentSession();
        if (session) {
            if (confirm('Ви впевнені, що хочете завершити тренування?')) {
                this.workoutTimer.stop();
                const duration: number = this.workoutTimer.getTotalSeconds();
                this.apiService.finishWorkoutSession(duration);
                this.historyController.loadHistory();
                this.stopRestTimer();
                this.navigationService.navigateTo('home');
            }
        }
    }

    public showExerciseModal(exercise?: Exercise): void {
        this.currentEditingExercise = exercise || null;
        
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

    public saveExercise(): void {
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
            if (this.currentEditingExercise) {
                this.apiService.updateExercise(this.currentEditingExercise.id, name, sets, reps, weight);
            } else {
                this.apiService.addExercise(name, sets, reps, weight);
            }

            this.renderExercises();
            this.updateVolumeDisplay();
            
            const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('exerciseModal'));
            if (modal) modal.hide();
            
            this.currentEditingExercise = null;
        } catch (error) {
            console.error('Error saving exercise:', error);
            alert('Помилка збереження вправи');
        }
    }

    public renderExercises(): void {
        const exercisesList: HTMLElement | null = document.getElementById('exercisesList');
        if (!exercisesList) return;

        exercisesList.innerHTML = '';

        const session: WorkoutSession | null = this.apiService.getCurrentSession();
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
            
            const volumeText = exercise.volume ? formatVolume(exercise.volume) : '0 кг';
            
            cardElement.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-5">
                        <h5 class="mb-1">${exercise.name}</h5>
                        <div class="d-flex gap-3 flex-wrap">
                            <span><i class="fas fa-dumbbell me-1"></i>${exercise.sets} підходи</span>
                            <span><i class="fas fa-repeat me-1"></i>${exercise.reps} повтори</span>
                            <span><i class="fas fa-weight-hanging me-1"></i>${exercise.weight} кг</span>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="text-center">
                            <small class="text-muted d-block">Об'єм</small>
                            <strong class="text-primary">${volumeText}</strong>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <button class="btn btn-sm btn-outline-success" onclick="workoutController.startRestTimer()">
                                <i class="fas fa-clock"></i> Відпочинок
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="workoutController.editExercise('${exercise.id}')"><i class="fas fa-edit me-2"></i>Редагувати</a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="workoutController.deleteExercise('${exercise.id}')"><i class="fas fa-trash me-2"></i>Видалити</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            
            exercisesList.appendChild(cardElement);
        });
    }

    public updateVolumeDisplay(): void {
        const session: WorkoutSession | null = this.apiService.getCurrentSession();
        const volumeElement: HTMLElement | null = document.getElementById('sessionVolume');
        
        if (volumeElement && session) {
            const totalVolume = session.totalVolume || 0;
            volumeElement.textContent = formatVolume(totalVolume);
        }
    }

    public editExercise(exerciseId: string): void {
        const session: WorkoutSession | null = this.apiService.getCurrentSession();
        if (session) {
            const exercise: Exercise | undefined = session.exercises.find(ex => ex.id === exerciseId);
            if (exercise) {
                this.showExerciseModal(exercise);
            }
        }
    }

    public deleteExercise(exerciseId: string): void {
        if (confirm('Ви впевнені, що хочете видалити цю вправу?')) {
            this.apiService.removeExercise(exerciseId);
            this.renderExercises();
            this.updateVolumeDisplay();
        }
    }

    public startRestTimer(): void {
        const restTimerElement: HTMLElement | null = document.getElementById('restTimer');
        if (restTimerElement) {
            restTimerElement.classList.remove('hidden');
            this.restTimer.start(90); // 90 секунд за замовчуванням
            
            const pauseBtn: HTMLElement | null = document.getElementById('pauseTimerBtn');
            const icon: HTMLElement | null = pauseBtn?.querySelector('i') || null;
            if (icon) {
                icon.className = 'fas fa-pause';
            }
        }
    }

    public stopRestTimer(): void {
        this.restTimer.stop();
        const restTimerElement: HTMLElement | null = document.getElementById('restTimer');
        if (restTimerElement) {
            restTimerElement.classList.add('hidden');
        }
    }

    public toggleRestTimer(): void {
        const pauseBtn: HTMLElement | null = document.getElementById('pauseTimerBtn');
        const icon: HTMLElement | null = pauseBtn?.querySelector('i') || null;
        
        if (this.restTimer.isActive()) {
            this.restTimer.pause();
            if (icon) {
                icon.className = 'fas fa-play';
            }
        } else {
            this.restTimer.resume();
            if (icon) {
                icon.className = 'fas fa-pause';
            }
        }
    }
}