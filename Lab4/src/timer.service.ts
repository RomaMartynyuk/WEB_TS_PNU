// Personal Platz - Сервіси таймерів
// Управління таймерами тренування та відпочинку

import { TimerCallback } from './types.js';
import { formatDuration } from './utils.js';

export class TimerService {
    private startTime: number = 0;
    private elapsedTime: number = 0;
    private isRunning: boolean = false;
    private intervalId: number | null = null;
    private callbacks: TimerCallback[] = [];

    public start(): void {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.intervalId = window.setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.notifyCallbacks();
            }, 1000);
        }
    }

    public stop(): void {
        if (this.isRunning && this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            this.intervalId = null;
        }
    }

    public reset(): void {
        this.stop();
        this.elapsedTime = 0;
        this.notifyCallbacks();
    }

    public subscribe(callback: TimerCallback): void {
        this.callbacks.push(callback);
    }

    public getTotalSeconds(): number {
        return Math.floor(this.elapsedTime / 1000);
    }

    private notifyCallbacks(): void {
        const formattedTime: string = formatDuration(this.getTotalSeconds());
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}

export class RestTimerService {
    private remaining: number = 0;
    private isRunning: boolean = false;
    private intervalId: number | null = null;
    private callbacks: TimerCallback[] = [];

    public start(durationSeconds: number): void {
        this.remaining = durationSeconds;
        this.isRunning = true;
        
        this.intervalId = window.setInterval(() => {
            this.remaining--;
            this.notifyCallbacks();
            
            if (this.remaining <= 0) {
                this.stop();
            }
        }, 1000);
        
        this.notifyCallbacks();
    }

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.remaining = 0;
    }

    public pause(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    public resume(): void {
        if (!this.isRunning && this.remaining > 0) {
            this.isRunning = true;
            this.intervalId = window.setInterval(() => {
                this.remaining--;
                this.notifyCallbacks();
                
                if (this.remaining <= 0) {
                    this.stop();
                }
            }, 1000);
        }
    }

    public subscribe(callback: TimerCallback): void {
        this.callbacks.push(callback);
    }

    public isActive(): boolean {
        return this.isRunning;
    }

    private notifyCallbacks(): void {
        const minutes: number = Math.floor(this.remaining / 60);
        const seconds: number = this.remaining % 60;
        const formattedTime: string = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}