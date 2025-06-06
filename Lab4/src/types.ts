// Personal Platz - Типи та інтерфейси
// Визначення базових типів додатку

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    record: number;
    completed: boolean;
    volume?: number; // Додаємо поле для об'єму (sets * reps * weight)
}

export interface WorkoutSession {
    id: string;
    name: string;
    date: Date;
    exercises: Exercise[];
    duration: number;
    isActive: boolean;
    totalVolume?: number; // Додаємо загальний об'єм тренування
}

export type PageType = 'home' | 'workout' | 'history';

export interface TimerCallback {
    (time: string): void;
}