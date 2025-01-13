import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../config/gameConfig.js';
import { isDamageable } from '../interfaces/damageable.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class Tower {
    constructor(gridX, gridY) {
        this.container = new Container();
        this.gridPosition = { x: gridX, y: gridY };
        this.id = `tower-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Default values (will be configured by factory)
        this.isConnected = false;
        this.type = 'BASIC';
        this.range = 3;
        this.damage = 20;
        this.attackSpeed = 1;
        this.lastAttackTime = 0;
        this.currentTarget = null;
        this.projectiles = new Set();
        this.level = 1;
        
        // Create tower visuals
        this.createTower();
        this.updatePosition();

        // Setup event listeners
        this.setupEventListeners();

        // Emit tower initialized event
        eventManager.emit(GameEvents.TOWER_INITIALIZED, {
            tower: this,
            id: this.id,
            position: this.gridPosition
        });
    }

    setupEventListeners() {
        // Listen for tower configuration
        eventManager.subscribe(GameEvents.TOWER_CONFIGURE, (data) => {
            if (data.tower === this) {
                this.configureTower(data.config);
            }
        });
    }

    configureTower(config) {
        if (config.damage) this.damage = config.damage;
        if (config.range) {
            this.range = config.range;
            this.updateRangeIndicator();
        }
        if (config.attackSpeed) this.attackSpeed = config.attackSpeed;
        if (config.color) {
            this.turret.clear()
                .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.25)
                .fill({ color: config.color });
        }
    }

    createTower() {
        // Base tower graphics
        this.base = new Graphics()
            .rect(
                -GRID_CONFIG.CELL_SIZE * 0.4,
                -GRID_CONFIG.CELL_SIZE * 0.4,
                GRID_CONFIG.CELL_SIZE * 0.8,
                GRID_CONFIG.CELL_SIZE * 0.8
            )
            .fill({ color: 0x95a5a6 });

        this.turret = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.25)
            .fill({ color: 0x3498db });

        // Range indicator
        this.rangeIndicator = new Graphics();
        this.updateRangeIndicator();
        this.rangeIndicator.visible = false;

        // Projectiles container
        this.projectilesContainer = new Container();
        
        // Add all parts to container
        this.container.addChild(this.rangeIndicator, this.base, this.turret, this.projectilesContainer);
    }

    updateRangeIndicator() {
        this.rangeIndicator.clear()
            .circle(0, 0, this.range * GRID_CONFIG.CELL_SIZE)
            .fill({ color: 0x3498db, alpha: 0.1 })
            .setStrokeStyle({
                width: 2,
                color: 0x3498db,
                alpha: 0.3
            })
            .stroke();
    }

    setConnected(connected) {
        const wasConnected = this.isConnected;
        this.isConnected = connected;
        
        // Update visuals based on connection status
        if (this.turret) {
            this.turret.alpha = connected ? 1 : 0.5;
        }

        // Emit event only if connection status changed
        if (wasConnected !== connected) {
            eventManager.emit(GameEvents.TOWER_CONNECTION_CHANGED, {
                tower: this,
                id: this.id,
                isConnected: connected,
                position: this.gridPosition
            });
        }
    }

    createProjectile(targetEnemy) {
        const projectile = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.1)
            .fill({ color: 0xe74c3c }); // Red color for projectile

        projectile.targetEnemy = targetEnemy;
        projectile.speed = 10;
        projectile.position.set(0, 0);

        this.projectilesContainer.addChild(projectile);
        this.projectiles.add(projectile);

        eventManager.emit(GameEvents.TOWER_PROJECTILE_CREATED, {
            tower: this,
            id: this.id,
            target: targetEnemy
        });

        return projectile;
    }

    findTarget(enemies) {
        if (!this.isConnected || enemies.length === 0) {
            this.currentTarget = null;
            return;
        }

        let nearestDistance = Infinity;
        let nearestEnemy = null;
        const towerPos = this.getPosition();
        const rangeInPixels = this.range * GRID_CONFIG.CELL_SIZE;

        for (const enemy of enemies) {
            if (enemy.isDead()) continue;

            const enemyPos = enemy.getPosition();
            if (!enemyPos) continue;

            const distance = Math.sqrt(
                Math.pow(enemyPos.x - towerPos.x, 2) + 
                Math.pow(enemyPos.y - towerPos.y, 2)
            );

            if (distance <= rangeInPixels && distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }

        if (this.currentTarget !== nearestEnemy) {
            if (this.currentTarget) {
                eventManager.emit(GameEvents.TOWER_TARGET_LOST, {
                    tower: this,
                    id: this.id,
                    previousTarget: this.currentTarget
                });
            }

            this.currentTarget = nearestEnemy;

            if (nearestEnemy) {
                eventManager.emit(GameEvents.TOWER_TARGET_ACQUIRED, {
                    tower: this,
                    id: this.id,
                    target: nearestEnemy,
                    distance: nearestDistance
                });
            }
        }
    }

    attack(time) {
        if (!this.currentTarget || !this.isConnected) {
            return false;
        }

        // Check attack cooldown
        if (time - this.lastAttackTime < 1 / this.attackSpeed) {
            return false;
        }

        // Update last attack time
        this.lastAttackTime = time;

        // Create and shoot projectile
        this.createProjectile(this.currentTarget);
        
        eventManager.emit(GameEvents.TOWER_ATTACKED, {
            tower: this,
            id: this.id,
            target: this.currentTarget,
            damage: this.damage
        });

        return true;
    }

    updateProjectiles() {
        for (const projectile of this.projectiles) {
            if (!projectile.targetEnemy || !projectile.targetEnemy.container.parent) {
                this.projectiles.delete(projectile);
                projectile.destroy();
                continue;
            }

            const targetPos = projectile.targetEnemy.getPosition();
            if (!targetPos) {
                // Target is destroyed or invalid
                this.projectiles.delete(projectile);
                projectile.destroy();
                continue;
            }

            const towerPos = this.getPosition();
            const targetX = targetPos.x - towerPos.x;
            const targetY = targetPos.y - towerPos.y;

            const dx = targetX - projectile.position.x;
            const dy = targetY - projectile.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                // Hit the target
                if (isDamageable(projectile.targetEnemy) && !projectile.targetEnemy.isDead()) {
                    projectile.targetEnemy.takeDamage(this.damage);
                    eventManager.emit(GameEvents.TOWER_HIT_TARGET, {
                        tower: this,
                        id: this.id,
                        target: projectile.targetEnemy,
                        damage: this.damage,
                        position: targetPos
                    });
                }
                this.projectiles.delete(projectile);
                projectile.destroy();
            } else {
                // Move towards target
                const vx = (dx / distance) * projectile.speed;
                const vy = (dy / distance) * projectile.speed;
                projectile.position.x += vx;
                projectile.position.y += vy;
            }
        }
    }

    update(time, enemies) {
        if (!this.isConnected) {
            if (this.currentTarget) {
                this.currentTarget = null;
                eventManager.emit(GameEvents.TOWER_TARGET_LOST, {
                    tower: this,
                    id: this.id,
                    reason: 'disconnected'
                });
            }
            return;
        }

        this.findTarget(enemies);

        if (this.currentTarget && !this.currentTarget.isDead()) {
            const targetPos = this.currentTarget.getPosition();
            if (targetPos) {
                const towerPos = this.getPosition();
                this.turret.rotation = Math.atan2(
                    targetPos.y - towerPos.y,
                    targetPos.x - towerPos.x
                );
                this.attack(time);
            } else {
                this.currentTarget = null;
            }
        }

        this.updateProjectiles();
    }

    showRange(show = true) {
        this.rangeIndicator.visible = show;
    }

    getGridPosition() {
        return { ...this.gridPosition };
    }

    getPosition() {
        return {
            x: this.container.position.x,
            y: this.container.position.y
        };
    }

    updatePosition() {
        const pixelPos = this.gridToPixel(this.gridPosition.x, this.gridPosition.y);
        this.container.position.set(pixelPos.x, pixelPos.y);
    }

    gridToPixel(gridX, gridY) {
        return {
            x: gridX * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2,
            y: gridY * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2
        };
    }

    getLevelInfo() {
        return {
            level: this.level,
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed
        };
    }

    destroy() {
        eventManager.emit(GameEvents.TOWER_DESTROYED, {
            id: this.id,
            position: this.gridPosition,
            wasConnected: this.isConnected,
            type: this.type,
            level: this.level
        });
        this.container.destroy();
    }
}