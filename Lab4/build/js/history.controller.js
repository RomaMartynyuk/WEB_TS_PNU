import { formatDate, formatReadableDuration, formatVolume } from './utils.js';
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
            const volumeFormatted = session.totalVolume ? formatVolume(session.totalVolume) : '0 кг';
            sessionCard.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <h5 class="mb-1">${session.name}</h5>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                    <div class="col-md-2">
                        <div class="text-center">
                            <span class="badge bg-primary">${session.exercises.length} вправ</span>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <small class="text-muted d-block">Об'єм</small>
                            <strong class="text-success">${volumeFormatted}</strong>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-end">
                            <small class="text-muted d-block">Тривалість</small>
                            <span class="fw-bold">${durationFormatted}</span>
                        </div>
                    </div>
                </div>
                ${session.exercises.length > 0 ? `
                    <div class="mt-3">
                        <small class="text-muted">Вправи: ${session.exercises.map((ex) => {
                const exerciseVolume = ex.volume ? ` (${formatVolume(ex.volume)})` : '';
                return `${ex.name}${exerciseVolume}`;
            }).join(', ')}</small>
                    </div>
                ` : ''}
                ${this.renderVolumeProgress(session, workoutHistory)}
            `;
            historyList.appendChild(sessionCard);
        });
    }
    renderVolumeProgress(currentSession, allSessions) {
        if (!currentSession.totalVolume || allSessions.length < 2)
            return '';
        const sortedSessions = allSessions
            .filter(s => s.date.getTime() < currentSession.date.getTime())
            .sort((a, b) => b.date.getTime() - a.date.getTime());
        if (sortedSessions.length === 0)
            return '';
        const previousSession = sortedSessions[0];
        if (!previousSession.totalVolume)
            return '';
        const volumeDiff = currentSession.totalVolume - previousSession.totalVolume;
        const percentChange = ((volumeDiff / previousSession.totalVolume) * 100);
        if (Math.abs(percentChange) < 1)
            return '';
        const isIncrease = volumeDiff > 0;
        const icon = isIncrease ? 'fas fa-arrow-up text-success' : 'fas fa-arrow-down text-danger';
        const sign = isIncrease ? '+' : '';
        const color = isIncrease ? 'text-success' : 'text-danger';
        return `
            <div class="mt-2">
                <small class="${color}">
                    <i class="${icon} me-1"></i>
                    ${sign}${formatVolume(Math.abs(volumeDiff))} (${sign}${percentChange.toFixed(1)}%) порівняно з попереднім тренуванням
                </small>
            </div>
        `;
    }
}
