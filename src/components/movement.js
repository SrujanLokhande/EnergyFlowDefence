import { GRID_CONFIG } from '../config/gameConfig.js';

export class Movement {
    constructor(container, options = {}) {
        this.container = container;
        this.speed = options.speed || 5;
        this.bounds = {
            minX: GRID_CONFIG.CELL_SIZE / 2,
            maxX: GRID_CONFIG.WIDTH * GRID_CONFIG.CELL_SIZE - GRID_CONFIG.CELL_SIZE / 2,
            minY: GRID_CONFIG.CELL_SIZE / 2,
            maxY: GRID_CONFIG.HEIGHT * GRID_CONFIG.CELL_SIZE - GRID_CONFIG.CELL_SIZE / 2
        };
        this.velocity = { x: 0, y: 0 };
        this.updateRotation = false;
    }

    setSpeed(speed) {
        this.speed = Math.max(0, speed);
    }

    getSpeed() {
        return this.speed;
    }

    // Update position based on velocity
    update() {
        if (this.velocity.x === 0 && this.velocity.y === 0) return;

        // Calculate new position using the already normalized velocity
        const newX = this.container.position.x + (this.velocity.x * this.speed);
        const newY = this.container.position.y + (this.velocity.y * this.speed);

        // Apply boundary constraints
        this.container.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, newX));
        this.container.position.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, newY));

        // Update rotation based on movement direction (if enabled)
        if (this.updateRotation) {
            this.container.rotation = Math.atan2(this.velocity.y, this.velocity.x);
        }
    }

    // Set velocity directly (useful for AI movement)
    setVelocity(x, y) {
        // Normalize the velocity if there's diagonal movement
        if (x !== 0 && y !== 0) {
            const magnitude = Math.sqrt(x * x + y * y);
            this.velocity.x = x / magnitude;
            this.velocity.y = y / magnitude;
        } else {
            this.velocity.x = x;
            this.velocity.y = y;
        }
    }

    // Move towards a target point (useful for AI)
    moveTowards(targetX, targetY) {
        const dx = targetX - this.container.position.x;
        const dy = targetY - this.container.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.velocity.x = dx / distance;
            this.velocity.y = dy / distance;
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
    }

    // Enable/disable rotation updates
    setRotationEnabled(enabled) {
        this.updateRotation = enabled;
    }

    // Get current position
    getPosition() {
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }

    // Stop all movement
    stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    // Set movement bounds
    setBounds(bounds) {
        this.bounds = { ...this.bounds, ...bounds };
    }
}