import { formatVolume } from './utils.js';
export class WorkoutController {
    constructor(apiService, workoutTimer, restTimer, navigationService, historyController) {
        this.apiService = apiService;
        this.workoutTimer = workoutTimer;
        this.restTimer = restTimer;
        this.navigationService = navigationService;
        this.historyController = historyController;
        this.currentEditingExercise = null;
    }
    setHistoryController(historyController) {
        this.historyController = historyController;
    }
    startNewWorkout() {
        const session = this.apiService.createWorkoutSession('Нове тренування');
        this.workoutTimer.reset();
        this.workoutTimer.start();
        this.navigationService.navigateTo('workout');
        this.renderExercises();
        this.updateVolumeDisplay();
        const sessionNameInput = document.getElementById('sessionName');
        if (sessionNameInput) {
            sessionNameInput.value = session.name;
        }
    }
    finishWorkout() {
        const session = this.apiService.getCurrentSession();
        if (session) {
            if (confirm('Ви впевнені, що хочете завершити тренування?')) {
                this.workoutTimer.stop();
                const duration = this.workoutTimer.getTotalSeconds();
                this.apiService.finishWorkoutSession(duration);
                this.historyController.loadHistory();
                this.stopRestTimer();
                this.navigationService.navigateTo('home');
            }
        }
    }
    showExerciseModal(exercise) {
        this.currentEditingExercise = exercise || null;
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
    saveExercise() {
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
            if (this.currentEditingExercise) {
                this.apiService.updateExercise(this.currentEditingExercise.id, name, sets, reps, weight);
            }
            else {
                this.apiService.addExercise(name, sets, reps, weight);
            }
            this.renderExercises();
            this.updateVolumeDisplay();
            const modal = window.bootstrap.Modal.getInstance(document.getElementById('exerciseModal'));
            if (modal)
                modal.hide();
            this.currentEditingExercise = null;
        }
        catch (error) {
            console.error('Error saving exercise:', error);
            alert('Помилка збереження вправи');
        }
    }
    renderExercises() {
        const exercisesList = document.getElementById('exercisesList');
        if (!exercisesList)
            return;
        exercisesList.innerHTML = '';
        const session = this.apiService.getCurrentSession();
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
    updateVolumeDisplay() {
        const session = this.apiService.getCurrentSession();
        const volumeElement = document.getElementById('sessionVolume');
        if (volumeElement && session) {
            const totalVolume = session.totalVolume || 0;
            volumeElement.textContent = formatVolume(totalVolume);
        }
    }
    editExercise(exerciseId) {
        const session = this.apiService.getCurrentSession();
        if (session) {
            const exercise = session.exercises.find(ex => ex.id === exerciseId);
            if (exercise) {
                this.showExerciseModal(exercise);
            }
        }
    }
    deleteExercise(exerciseId) {
        if (confirm('Ви впевнені, що хочете видалити цю вправу?')) {
            this.apiService.removeExercise(exerciseId);
            this.renderExercises();
            this.updateVolumeDisplay();
        }
    }
    startRestTimer() {
        const restTimerElement = document.getElementById('restTimer');
        if (restTimerElement) {
            restTimerElement.classList.remove('hidden');
            this.restTimer.start(90);
            const pauseBtn = document.getElementById('pauseTimerBtn');
            const icon = (pauseBtn === null || pauseBtn === void 0 ? void 0 : pauseBtn.querySelector('i')) || null;
            if (icon) {
                icon.className = 'fas fa-pause';
            }
        }
    }
    stopRestTimer() {
        this.restTimer.stop();
        const restTimerElement = document.getElementById('restTimer');
        if (restTimerElement) {
            restTimerElement.classList.add('hidden');
        }
    }
    toggleRestTimer() {
        const pauseBtn = document.getElementById('pauseTimerBtn');
        const icon = (pauseBtn === null || pauseBtn === void 0 ? void 0 : pauseBtn.querySelector('i')) || null;
        if (this.restTimer.isActive()) {
            this.restTimer.pause();
            if (icon) {
                icon.className = 'fas fa-play';
            }
        }
        else {
            this.restTimer.resume();
            if (icon) {
                icon.className = 'fas fa-pause';
            }
        }
    }
}
