// Personal Platz - Утилітні функції
// Допоміжні функції для форматування та генерації

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDuration(totalSeconds: number): string {
    const hours: number = Math.floor(totalSeconds / 3600);
    const minutes: number = Math.floor((totalSeconds % 3600) / 60);
    const seconds: number = totalSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

export function formatReadableDuration(totalSeconds: number): string {
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

export function formatDate(date: Date): string {
    return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Нові функції для розрахунку об'єму
export function calculateExerciseVolume(sets: number, reps: number, weight: number): number {
    return sets * reps * weight;
}

export function formatVolume(volume: number): string {
    if (volume >= 1000) {
        return `${(volume / 1000).toFixed(1)}к кг`;
    }
    return `${volume.toFixed(1)} кг`;
}

export function calculateSessionVolume(exercises: Array<{sets: number, reps: number, weight: number}>): number {
    return exercises.reduce((total, exercise) => {
        return total + calculateExerciseVolume(exercise.sets, exercise.reps, exercise.weight);
    }, 0);
}