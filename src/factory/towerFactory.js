import { Tower } from '../components/tower/tower.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';
import { TowerTypes, TowerConfigs } from '../config/towerConfig.js';

export class TowerFactory {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        eventManager.subscribe(GameEvents.TOWER_UPGRADE_REQUESTED, (data) => {
            const upgraded = this.upgradeTower(data.tower);
            if (upgraded) {
                eventManager.emit(GameEvents.TOWER_UPGRADED, {
                    tower: data.tower,
                    cost: data.cost,
                    newStats: this.getUpgradeStats(data.tower)
                });
            }
        });
    }

    createTower(type, gridX, gridY) {
        console.log('[TowerFactory] Creating tower:', { type, gridX, gridY });
        const config = TowerConfigs[type];
        
        if (!config) {
            console.error(`Invalid tower type: ${type}`);
            return null;
        }
    
        // Create base tower
        const tower = new Tower(gridX, gridY);
        tower.type = type;
    
        // Configure tower stats based on the type's config
        tower.setStats({
            damage: config.damage,
            range: config.range,
            attackSpeed: config.attackSpeed
        });
    
        // Set the tower's color based on type
        if (tower.visuals) {
            tower.visuals.setColor(config.color);
        }
    
        console.log('[TowerFactory] Tower created with type:', tower.type);
        return tower;
    }

    configureTower(tower, config) {
        eventManager.emit(GameEvents.TOWER_CONFIGURE, {
            tower,
            config: {
                damage: config.damage,
                range: config.range,
                attackSpeed: config.attackSpeed,
                color: config.color
            }
        });
    }

    upgradeTower(tower) {
        const config = TowerConfigs[tower.type];
        if (!config) return false;

        const upgradeStats = this.getUpgradeStats(tower);
        this.configureTower(tower, upgradeStats);
        tower.level += 1;

        return true;
    }

    getUpgradeStats(tower) {
        const config = TowerConfigs[tower.type];
        const multipliers = config.upgradeMultipliers;

        return {
            damage: tower.stats.damage * multipliers.damage,
            range: tower.stats.range * multipliers.range,
            attackSpeed: tower.stats.attackSpeed * multipliers.attackSpeed,
            color: config.color,
            upgradeCost: config.upgradeCost * Math.pow(multipliers.upgradeCost, tower.level - 1)
        };
    }

    getTowerCost(type) {
        return TowerConfigs[type]?.cost || 0;
    }

    getUpgradeCost(tower) {
        const config = TowerConfigs[tower.type];
        if (!config) return 0;
        
        return Math.floor(
            config.upgradeCost * 
            Math.pow(config.upgradeMultipliers.upgradeCost, tower.level - 1)
        );
    }
}