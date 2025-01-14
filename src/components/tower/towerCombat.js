import { Container, Graphics } from 'pixi.js';
import { GRID_CONFIG } from '../../config/gameConfig.js';
import { isDamageable } from '../../interfaces/damageable.js';
import { eventManager } from '../../managers/eventManager.js';
import { GameEvents } from '../../config/eventTypes.js';

export class TowerCombat {
    constructor(tower) {
        this.tower = tower;
        this.lastAttackTime = 0;
        this.currentTarget = null;
        
        // Create projectiles container
        this.projectilesContainer = new Container();
        this.projectiles = new Set();
        this.tower.container.addChild(this.projectilesContainer);
    }

    findTarget(enemies) {
        if (!this.tower.isConnected || !enemies.length) {
            this.currentTarget = null;
            return;
        }

        let nearestDistance = Infinity;
        let nearestEnemy = null;
        const towerPos = this.tower.getPosition();
        const rangeInPixels = this.tower.stats.range * GRID_CONFIG.CELL_SIZE;

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

        this.currentTarget = nearestEnemy;
    }

    attack(time) {
        if (!this.currentTarget || !this.tower.isConnected) return false;

        // Check attack cooldown
        if (time - this.lastAttackTime < 1 / this.tower.stats.attackSpeed) {
            return false;
        }

        // Update last attack time
        this.lastAttackTime = time;

        // Create and shoot projectile
        this.createProjectile(this.currentTarget);
        
        eventManager.emit(GameEvents.TOWER_ATTACKED, {
            tower: this.tower,
            id: this.tower.id,
            target: this.currentTarget,
            damage: this.tower.stats.damage
        });

        return true;
    }

    createProjectile(targetEnemy) {
        const projectile = new Graphics()
            .circle(0, 0, GRID_CONFIG.CELL_SIZE * 0.1)
            .fill({ color: 0xe74c3c });

        projectile.targetEnemy = targetEnemy;
        projectile.speed = 10;
        projectile.position.set(0, 0);

        this.projectilesContainer.addChild(projectile);
        this.projectiles.add(projectile);
    }

    updateProjectiles() {
        for (const projectile of this.projectiles) {
            if (!projectile.targetEnemy || !projectile.targetEnemy.container.parent) {
                this.removeProjectile(projectile);
                continue;
            }

            const targetPos = projectile.targetEnemy.getPosition();
            if (!targetPos) {
                this.removeProjectile(projectile);
                continue;
            }

            const towerPos = this.tower.getPosition();
            const targetX = targetPos.x - towerPos.x;
            const targetY = targetPos.y - towerPos.y;

            const dx = targetX - projectile.position.x;
            const dy = targetY - projectile.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                // Hit the target
                if (isDamageable(projectile.targetEnemy) && !projectile.targetEnemy.isDead()) {
                    projectile.targetEnemy.takeDamage(this.tower.stats.damage);
                    eventManager.emit(GameEvents.TOWER_HIT_TARGET, {
                        tower: this.tower,
                        id: this.tower.id,
                        target: projectile.targetEnemy,
                        damage: this.tower.stats.damage,
                        position: targetPos
                    });
                }
                this.removeProjectile(projectile);
            } else {
                // Move towards target
                const vx = (dx / distance) * projectile.speed;
                const vy = (dy / distance) * projectile.speed;
                projectile.position.x += vx;
                projectile.position.y += vy;
            }
        }
    }

    removeProjectile(projectile) {
        this.projectiles.delete(projectile);
        projectile.destroy();
    }

    update(time, enemies) {
        if (!this.tower.isConnected) {
            this.currentTarget = null;
            return;
        }

        this.findTarget(enemies);

        if (this.currentTarget && !this.currentTarget.isDead()) {
            const targetPos = this.currentTarget.getPosition();
            if (targetPos) {
                const towerPos = this.tower.getPosition();
                const rotation = Math.atan2(
                    targetPos.y - towerPos.y,
                    targetPos.x - towerPos.x
                );
                this.tower.visuals.setTurretRotation(rotation);
                this.attack(time);
            } else {
                this.currentTarget = null;
            }
        }

        this.updateProjectiles();
    }

    destroy() {
        for (const projectile of this.projectiles) {
            projectile.destroy();
        }
        this.projectiles.clear();
        this.projectilesContainer.destroy();
    }
}