// Personal Platz - API сервіс
// Управління даними тренувань та локальним сховищем

import { WorkoutSession, Exercise } from './types.js';
import { generateId, calculateExerciseVolume, calculateSessionVolume } from './utils.js';

export class ApiService {
    private workoutSessions: WorkoutSession[] = [];
    private currentSession: WorkoutSession | null = null;
    private readonly storageKey: string = 'personalPlatzWorkouts';

    constructor() {
        this.loadFromStorage();
    }

    public createWorkoutSession(name: string): WorkoutSession {
        const session: WorkoutSession = {
            id: generateId(),
            name: name,
            date: new Date(),
            exercises: [],
            duration: 0,
            isActive: true,
            totalVolume: 0
        };
        
        this.currentSession = session;
        return session;
    }

    public addExercise(name: string, sets: number, reps: number, weight: number): Exercise {
        if (!this.currentSession) {
            throw new Error('No active workout session');
        }

        const volume = calculateExerciseVolume(sets, reps, weight);
        
        const newExercise: Exercise = {
            id: generateId(),
            name: name,
            sets: sets,
            reps: reps,
            weight: weight,
            record: 0,
            completed: false,
            volume: volume
        };

        this.currentSession.exercises.push(newExercise);
        this.updateSessionVolume();
        return newExercise;
    }

    public updateExercise(exerciseId: string, name: string, sets: number, reps: number, weight: number): Exercise | null {
        if (!this.currentSession) return null;

        const exerciseIndex: number = this.currentSession.exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex === -1) return null;

        const volume = calculateExerciseVolume(sets, reps, weight);

        this.currentSession.exercises[exerciseIndex].name = name;
        this.currentSession.exercises[exerciseIndex].sets = sets;
        this.currentSession.exercises[exerciseIndex].reps = reps;
        this.currentSession.exercises[exerciseIndex].weight = weight;
        this.currentSession.exercises[exerciseIndex].volume = volume;

        this.updateSessionVolume();
        return this.currentSession.exercises[exerciseIndex];
    }

    public removeExercise(exerciseId: string): boolean {
        if (!this.currentSession) return false;

        const initialLength: number = this.currentSession.exercises.length;
        this.currentSession.exercises = this.currentSession.exercises.filter(ex => ex.id !== exerciseId);
        
        if (this.currentSession.exercises.length < initialLength) {
            this.updateSessionVolume();
            return true;
        }
        return false;
    }

    public finishWorkoutSession(duration: number): void {
        if (!this.currentSession) return;

        this.currentSession.duration = duration;
        this.currentSession.isActive = false;
        this.updateSessionVolume();
        this.workoutSessions.push(this.currentSession);
        this.saveToStorage();
        this.currentSession = null;
    }

    public getCurrentSession(): WorkoutSession | null {
        return this.currentSession;
    }

    public getWorkoutHistory(): WorkoutSession[] {
        return this.workoutSessions.filter(session => !session.isActive);
    }

    public updateSessionName(name: string): void {
        if (this.currentSession) {
            this.currentSession.name = name;
        }
    }

    private updateSessionVolume(): void {
        if (!this.currentSession) return;
        
        this.currentSession.totalVolume = calculateSessionVolume(this.currentSession.exercises);
    }

    private loadFromStorage(): void {
        try {
            const stored: string | null = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.workoutSessions = parsed.map((session: any) => {
                    // Обчислюємо об'єм для старих сесій, якщо він відсутній
                    const exercises = session.exercises.map((ex: any) => ({
                        ...ex,
                        volume: ex.volume || calculateExerciseVolume(ex.sets, ex.reps, ex.weight)
                    }));
                    
                    return {
                        ...session,
                        date: new Date(session.date),
                        exercises: exercises,
                        totalVolume: session.totalVolume || calculateSessionVolume(exercises)
                    };
                });
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.workoutSessions));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
}