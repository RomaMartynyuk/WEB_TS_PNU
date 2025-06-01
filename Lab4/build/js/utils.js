export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
export function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
export function formatReadableDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
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
export function formatDate(date) {
    return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
export function calculateExerciseVolume(sets, reps, weight) {
    return sets * reps * weight;
}
export function formatVolume(volume) {
    if (volume >= 1000) {
        return `${(volume / 1000).toFixed(1)}к кг`;
    }
    return `${volume.toFixed(1)} кг`;
}
export function calculateSessionVolume(exercises) {
    return exercises.reduce((total, exercise) => {
        return total + calculateExerciseVolume(exercise.sets, exercise.reps, exercise.weight);
    }, 0);
}
