import { formatDate, formatReadableDuration } from './utils.js';
export class HistoryController {
    constructor(apiService) {
        this.apiService = apiService;
    }
    loadHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList)
            return;
        const workoutHistory = this.apiService.getWorkoutHistory();
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
}
