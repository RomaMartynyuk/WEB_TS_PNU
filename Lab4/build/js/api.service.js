import { generateId } from './utils.js';
export class ApiService {
    constructor() {
        this.workoutSessions = [];
        this.currentSession = null;
        this.storageKey = 'personalPlatzWorkouts';
        this.loadFromStorage();
    }
    createWorkoutSession(name) {
        const session = {
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
    addExercise(name, sets, reps, weight) {
        if (!this.currentSession) {
            throw new Error('No active workout session');
        }
        const newExercise = {
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
    updateExercise(exerciseId, name, sets, reps, weight) {
        if (!this.currentSession)
            return null;
        const exerciseIndex = this.currentSession.exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex === -1)
            return null;
        this.currentSession.exercises[exerciseIndex].name = name;
        this.currentSession.exercises[exerciseIndex].sets = sets;
        this.currentSession.exercises[exerciseIndex].reps = reps;
        this.currentSession.exercises[exerciseIndex].weight = weight;
        return this.currentSession.exercises[exerciseIndex];
    }
    removeExercise(exerciseId) {
        if (!this.currentSession)
            return false;
        const initialLength = this.currentSession.exercises.length;
        this.currentSession.exercises = this.currentSession.exercises.filter(ex => ex.id !== exerciseId);
        return this.currentSession.exercises.length < initialLength;
    }
    finishWorkoutSession(duration) {
        if (!this.currentSession)
            return;
        this.currentSession.duration = duration;
        this.currentSession.isActive = false;
        this.workoutSessions.push(this.currentSession);
        this.saveToStorage();
        this.currentSession = null;
    }
    getCurrentSession() {
        return this.currentSession;
    }
    getWorkoutHistory() {
        return this.workoutSessions.filter(session => !session.isActive);
    }
    updateSessionName(name) {
        if (this.currentSession) {
            this.currentSession.name = name;
        }
    }
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.workoutSessions = parsed.map((session) => (Object.assign(Object.assign({}, session), { date: new Date(session.date) })));
            }
        }
        catch (error) {
            console.error('Error loading from storage:', error);
        }
    }
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.workoutSessions));
        }
        catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
}
