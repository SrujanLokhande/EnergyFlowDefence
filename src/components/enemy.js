import { Container, Graphics } from 'pixi.js';
import { Movement } from './movement.js';
import { Health } from './health.js';
import { GRID_CONFIG } from '../config/gameConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class Enemy {
    constructor(x, y, type = 'GRUNT') {
        this.container = new Container();
        this.type = type;
        this.speed = 2;
        this.value = 10;
        this.size = 0.3;
        this.color = 0xe74c3c;
        this.id = `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Initialize components
        this.movement = new Movement(this.container, { speed: this.speed });
        this.health = new Health({
            maxHealth: 100,
            showHealthBar: true,
            healthBarOffset: { x: 0, y: -GRID_CONFIG.CELL_SIZE * 0.5 },
            onZeroHealth: () => this.onDeath(),
            entityId: this.id
        });

        // Create enemy visuals
        this.createEnemy();
        
        // Set initial position
        this.container.position.set(x, y);
        
        // Add health bar to container
        this.container.addChild(this.health.container);

        // Setup event listeners
        this.setupEventListeners();

        // Emit initialization event
        eventManager.emit(GameEvents.ENEMY_INITIALIZED, {
            enemy: this,
            type: this.type,
            id: this.id,
            position: { x, y }
        });
    }

    setupEventListeners() {
        // Configuration listeners
        eventManager.subscribe(GameEvents.ENEMY_CONFIGURE_HEALTH, (data) => {
            if (data.enemy === this) {
                this.health.setMaxHealth(data.health);
                this.health.setHealth(data.health);
            }
        });

        eventManager.subscribe(GameEvents.ENEMY_CONFIGURE_MOVEMENT, (data) => {
            if (data.enemy === this) {
                this.speed = data.speed;
                this.movement.setSpeed(data.speed);
            }
        });

        eventManager.subscribe(GameEvents.ENEMY_CONFIGURE_VISUALS, (data) => {
            if (data.enemy === this) {
                this.setColor(data.color);
                this.setSize(data.size);
            }
        });
    }

    createEnemy() {
        // Create enemy body
        this.body = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * this.size)
            .fill({ color: this.color });

        this.container.addChild(this.body);
    }

    setColor(color) {
        this.color = color;
        this.updateVisuals();
    }

    setSize(size) {
        this.size = size;
        this.updateVisuals();
    }

    updateVisuals() {
        if (this.body) {
            this.body.clear()
                .circle(0, 0, GRID_CONFIG.CELL_SIZE * this.size)
                .fill({ color: this.color });
        }
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
        if (this.isDead()) return true;
        
        const isDead = this.health.takeDamage(amount);
        
        if (!this.isDead()) {
            eventManager.emit(GameEvents.ENEMY_DAMAGED, {
                enemy: this,
                id: this.id,
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
        
        // Emit movement event if position changed
        const newPos = this.getPosition();
        if (currentPos && newPos && 
            (currentPos.x !== newPos.x || currentPos.y !== newPos.y)) {
            eventManager.emit(GameEvents.ENEMY_MOVED, {
                enemy: this,
                id: this.id,
                from: currentPos,
                to: newPos,
                targetPosition: { x: targetX, y: targetY }
            });
        }
    }

    update() {
        if (this.isDead()) return;
        this.movement.update();
    }

    reachedCore() {
        eventManager.emit(GameEvents.ENEMY_REACHED_CORE, {
            enemy: this,
            id: this.id,
            type: this.type,
            position: this.getPosition(),
            damage: this.value
        });
    }
    
    getPosition() {
        if (!this.container || !this.container.parent) {
            return null;
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
        eventManager.emit(GameEvents.ENEMY_DESTROYED, {
            id: this.id,
            type: this.type,
            position: this.getPosition()
        });
        this.container.destroy();
    }
}