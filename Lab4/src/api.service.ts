// Personal Platz - API сервіс
// Управління даними тренувань та локальним сховищем

import { WorkoutSession, Exercise } from './types.js';
import { generateId } from './utils.js';

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
            isActive: true
        };
        
        this.currentSession = session;
        return session;
    }

    public addExercise(name: string, sets: number, reps: number, weight: number): Exercise {
        if (!this.currentSession) {
            throw new Error('No active workout session');
        }

        const newExercise: Exercise = {
            id: generateId(),
            name: name,
            sets: sets,
            reps: reps,
            weight: weight,
            record: 0,
            completed: false
        };

        this.currentSession.exercises.push(newExercise);
        return newExercise;
    }

    public updateExercise(exerciseId: string, name: string, sets: number, reps: number, weight: number): Exercise | null {
        if (!this.currentSession) return null;

        const exerciseIndex: number = this.currentSession.exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex === -1) return null;

        this.currentSession.exercises[exerciseIndex].name = name;
        this.currentSession.exercises[exerciseIndex].sets = sets;
        this.currentSession.exercises[exerciseIndex].reps = reps;
        this.currentSession.exercises[exerciseIndex].weight = weight;

        return this.currentSession.exercises[exerciseIndex];
    }

    public removeExercise(exerciseId: string): boolean {
        if (!this.currentSession) return false;

        const initialLength: number = this.currentSession.exercises.length;
        this.currentSession.exercises = this.currentSession.exercises.filter(ex => ex.id !== exerciseId);
        
        return this.currentSession.exercises.length < initialLength;
    }

    public finishWorkoutSession(duration: number): void {
        if (!this.currentSession) return;

        this.currentSession.duration = duration;
        this.currentSession.isActive = false;
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

    private loadFromStorage(): void {
        try {
            const stored: string | null = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.workoutSessions = parsed.map((session: any) => ({
                    ...session,
                    date: new Date(session.date)
                }));
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