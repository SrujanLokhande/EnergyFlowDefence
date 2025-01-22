import { Container } from 'pixi.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';
import { EnemyVisuals } from '../enemy/enemyVisual.js';
import { Movement } from '../movement.js';
import { Health } from '../../components/health.js';
import { GRID_CONFIG } from '../../config/gameConfig.js';

export class EnemyBase {
    constructor(x, y, type = 'GRUNT') {
        this.container = new Container();
        this.type = type;
        this.id = `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.value = 10;

        // Initialize components
        this.visuals = new EnemyVisuals(this.container);
        this.movement = new Movement(this.container);
        
        // Initialize health with proper configuration
        this.health = new Health({
            maxHealth: 100,
            showHealthBar: true,
            healthBarOffset: { x: 0, y: -GRID_CONFIG.CELL_SIZE * 0.5 },
            healthBarSize: {
                width: GRID_CONFIG.CELL_SIZE * 0.6,
                height: GRID_CONFIG.CELL_SIZE * 0.1
            },
            onZeroHealth: () => this.onDeath()
        });

        // Add health container to main container
        this.container.addChild(this.health.container);
        this.container.position.set(x, y);

        eventManager.emit(GameEvents.ENEMY_CREATED, {
            enemy: this,
            type: this.type,
            id: this.id,
            position: { x, y }
        });
    }

    configure(config) {
        this.value = config.value;
        this.visuals.setColor(config.color);
        this.visuals.setSize(config.size);
        this.movement.setSpeed(config.speed);
        this.health.setMaxHealth(config.health);
    }

    onDeath() {
        eventManager.emit(GameEvents.ENEMY_DIED, { 
            enemy: this,
            id: this.id,
            type: this.type,
            position: this.getPosition(),
            value: this.value
        });
    }

    takeDamage(amount) {        
        const isDead = this.health.takeDamage(amount);
        
        eventManager.emit(GameEvents.ENEMY_DAMAGED, {
            id: this.id,
            amount: amount,
            currentHealth: this.health.getHealth(),
            maxHealth: this.health.getMaxHealth()
        });
        
        return isDead;
    }

    getHealth() {
        return this.health.getHealth();
    }

    isDead() {
        return this.health.isDead();
    }

    moveTowards(targetX, targetY) {
        if (this.isDead()) return;
        this.movement.moveTowards(targetX, targetY);
    }

    update() {
        if (this.isDead()) return;
        this.movement.update();
        this.visuals.update();
    }

    getPosition() {
        if (!this.container || !this.container.parent) return null;
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }
}