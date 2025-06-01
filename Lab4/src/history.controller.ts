// Personal Platz - Контролер історії
// Управління відображенням історії тренувань

import { WorkoutSession, Exercise } from './types.js';
import { ApiService } from './api.service.js';
import { formatDate, formatReadableDuration } from './utils.js';

export class HistoryController {
    constructor(private apiService: ApiService) {}

    public loadHistory(): void {
        const historyList: HTMLElement | null = document.getElementById('historyList');
        if (!historyList) return;

        const workoutHistory: WorkoutSession[] = this.apiService.getWorkoutHistory();
        
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
}