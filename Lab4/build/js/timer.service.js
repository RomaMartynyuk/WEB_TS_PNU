import { formatDuration } from './utils.js';
export class TimerService {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.callbacks = [];
    }
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.intervalId = window.setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.notifyCallbacks();
            }, 1000);
        }
    }
    stop() {
        if (this.isRunning && this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            this.intervalId = null;
        }
    }
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.notifyCallbacks();
    }
    subscribe(callback) {
        this.callbacks.push(callback);
    }
    getTotalSeconds() {
        return Math.floor(this.elapsedTime / 1000);
    }
    notifyCallbacks() {
        const formattedTime = formatDuration(this.getTotalSeconds());
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}
export class RestTimerService {
    constructor() {
        this.remaining = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.callbacks = [];
    }
    start(durationSeconds) {
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
    stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.remaining = 0;
    }
    pause() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }
    resume() {
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
    subscribe(callback) {
        this.callbacks.push(callback);
    }
    isActive() {
        return this.isRunning;
    }
    notifyCallbacks() {
        const minutes = Math.floor(this.remaining / 60);
        const seconds = this.remaining % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.callbacks.forEach(callback => callback(formattedTime));
    }
}
