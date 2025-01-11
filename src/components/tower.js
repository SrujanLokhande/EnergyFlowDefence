import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG, TOWER_CONFIG } from '../config/gameConfig.js';
import { isDamageable } from '../interfaces/damageable.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class Tower {
    constructor(gridX, gridY) {
        this.container = new Container();
        this.gridPosition = { x: gridX, y: gridY };
        this.isConnected = false;
        this.range = TOWER_CONFIG.BASE_RANGE;
        this.damage = TOWER_CONFIG.BASE_DAMAGE;
        this.attackSpeed = TOWER_CONFIG.BASE_ATTACK_SPEED;
        this.lastAttackTime = 0;
        this.currentTarget = null;
        this.projectiles = new Set();
        
        this.createTower();
        this.updatePosition();

        // Emit tower created event
        eventManager.emit(GameEvents.TOWER_PLACED, {
            tower: this,
            position: this.gridPosition,
            cost: TOWER_CONFIG.COST
        });
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
        this.rangeIndicator = new Graphics()
            .circle(0, 0, this.range * GRID_CONFIG.CELL_SIZE)
            .fill({ color: 0x3498db, alpha: 0.1 })
            .setStrokeStyle({
                width: 2,
                color: 0x3498db,
                alpha: 0.3
            })
            .stroke();
        this.rangeIndicator.visible = false;

        // Projectiles container
        this.projectilesContainer = new Container();
        
        // Add all parts to container
        this.container.addChild(this.rangeIndicator, this.base, this.turret, this.projectilesContainer);
    }

    setConnected(connected) {
        const wasConnected = this.isConnected;
        this.isConnected = connected;
        
        // Visual feedback for connection status
        const color = connected ? 0x3498db : 0x95a5a6;
        this.turret.clear()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.25)
            .fill({ color });

        // Emit event only if connection status changed
        if (wasConnected !== connected) {
            eventManager.emit(GameEvents.TOWER_CONNECTION_CHANGED, {
                tower: this,
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
            // Skip dead enemies
            if (enemy.isDead()) continue;

            const enemyPos = enemy.getPosition();
            // Skip if position is null (enemy might be destroyed)
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
            // If current target is dead or out of range, clear it
            if (this.currentTarget && (this.currentTarget.isDead() || !nearestEnemy)) {
                eventManager.emit(GameEvents.TOWER_TARGET_LOST, {
                    tower: this,
                    reason: this.currentTarget.isDead() ? 'target_died' : 'target_out_of_range'
                });
            }

            this.currentTarget = nearestEnemy;
            
            if (nearestEnemy) {
                eventManager.emit(GameEvents.TOWER_TARGET_ACQUIRED, {
                    tower: this,
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
                    reason: 'disconnected'
                });
            }
            return;
        }

        this.findTarget(enemies);

        if (this.currentTarget && !this.currentTarget.isDead()) {
            const targetPos = this.currentTarget.getPosition();
            if (targetPos) {  // Check if position is valid
                const towerPos = this.getPosition();
                this.turret.rotation = Math.atan2(
                    targetPos.y - towerPos.y,
                    targetPos.x - towerPos.x
                );
                this.attack(time);
            } else {
                // Target has no valid position, clear it
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

    destroy() {
        eventManager.emit(GameEvents.TOWER_DESTROYED, {
            position: this.gridPosition,
            wasConnected: this.isConnected
        });
        this.container.destroy();
    }
}