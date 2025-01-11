import { Container, Graphics } from 'pixi.js';
import { Movement } from './movement.js';
import { Health } from './health.js';
import { GRID_CONFIG } from '../config/gameConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class Enemy {
    constructor(x, y, type = 'grunt') {
        this.container = new Container();
        this.type = type;
        this.speed = 2;
        this.value = 10;

        // Initialize components
        this.movement = new Movement(this.container, { speed: this.speed });
        this.health = new Health({
            maxHealth: 100,
            showHealthBar: true,
            healthBarOffset: { x: 0, y: -GRID_CONFIG.CELL_SIZE * 0.5 },
            onZeroHealth: () => this.onDeath()
        });

        // Create enemy visuals
        this.createEnemy();
        
        // Set initial position
        this.container.position.set(x, y);
        
        // Add health bar to container
        this.container.addChild(this.health.container);

        // Emit spawn event
        eventManager.emit(GameEvents.ENEMY_SPAWNED, { 
            enemy: this,
            type: this.type,
            position: this.getPosition()
        });
    }

    createEnemy() {
        // Create enemy body
        this.body = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.3)
            .fill({ color: 0xe74c3c }); // Red color for enemy

        this.container.addChild(this.body);
    }

    onDeath() {
        eventManager.emit(GameEvents.ENEMY_DIED, { 
            enemy: this,
            type: this.type,
            position: this.getPosition(),
            value: this.value
        });
    }

    takeDamage(amount) {
        if (this.isDead()) return true;
        
        const isDead = this.health.takeDamage(amount);
        
        if (!this.isDead()) {
            eventManager.emit(GameEvents.ENEMY_DAMAGED, {
                enemy: this,
                type: this.type,
                amount: amount,
                currentHealth: this.health.getHealth(),
                position: this.getPosition(),
                isDead: isDead
            });
        }

        return isDead;
    }
    moveTowards(targetX, targetY) {
        if (this.isDead()) return;

        const currentPos = this.getPosition();
        this.movement.moveTowards(targetX, targetY);

        // Only emit move event if position actually changed
        const newPos = this.getPosition();
        if (currentPos.x !== newPos.x || currentPos.y !== newPos.y) {
            eventManager.emit(GameEvents.ENEMY_MOVED, {
                enemy: this,
                position: newPos,
                targetPosition: { x: targetX, y: targetY }
            });
        }
    }

    reachedCore() {
        eventManager.emit(GameEvents.ENEMY_REACHED_CORE, {
            enemy: this,
            position: this.getPosition(),
            type: this.type,
            damage: this.value // Using value as damage for now
        });
    }

    update() {
        if (this.isDead()) return;
        this.movement.update();
    }

    getPosition() {
        if (!this.container || !this.container.parent) {
            return null; // Return null if enemy is destroyed
        }
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }

    isDead() {
        return this.health.isDead();
    }

    getHealth() {
        return this.health.getHealth();
    }

    destroy() {
        this.container.destroy();
    }
}