import { Tower } from '../components/tower.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

// Tower types enum
export const TowerTypes = {
    BASIC: 'BASIC',
    RAPID: 'RAPID',
    SNIPER: 'SNIPER',
    AOE: 'AOE'    // Area of Effect
};

// Tower configurations
const towerConfigs = {
    [TowerTypes.BASIC]: {
        damage: 20,
        range: 3,
        attackSpeed: 1,
        cost: 100,
        color: 0x3498db,
        upgradeCost: 75
    },
    [TowerTypes.RAPID]: {
        damage: 10,
        range: 2,
        attackSpeed: 2,
        cost: 150,
        color: 0x2ecc71,
        upgradeCost: 100
    },
    [TowerTypes.SNIPER]: {
        damage: 50,
        range: 5,
        attackSpeed: 0.5,
        cost: 200,
        color: 0xe74c3c,
        upgradeCost: 150
    },
    [TowerTypes.AOE]: {
        damage: 15,
        range: 2.5,
        attackSpeed: 0.8,
        cost: 250,
        color: 0x9b59b6,
        upgradeCost: 175
    }
};

export class TowerFactory {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for tower creation requests
        eventManager.subscribe(GameEvents.TOWER_CREATION_REQUESTED, (data) => {
            const tower = this.createTower(data.type, data.gridX, data.gridY);
            if (tower) {
                eventManager.emit(GameEvents.TOWER_PLACED, {
                    tower,
                    type: data.type,
                    position: { x: data.gridX, y: data.gridY },
                    cost: towerConfigs[data.type].cost
                });
            }
        });

        // Listen for tower upgrade requests
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
        console.log('TowerFactory creating tower:', { type, gridX, gridY });
        const config = towerConfigs[type];
        if (!config) {
            console.error(`Invalid tower type: ${type}`);
            eventManager.emit(GameEvents.TOWER_CREATION_FAILED, {
                reason: 'invalid_type',
                type: type
            });
            return null;
        }

        // Create base tower
        const tower = new Tower(gridX, gridY);
        tower.type = type;

        // Configure tower stats
        this.configureTower(tower, config);

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
        const config = towerConfigs[tower.type];
        if (!config) return false;

        // Calculate upgrade stats
        const upgradeStats = this.getUpgradeStats(tower);

        // Apply upgrades
        this.configureTower(tower, upgradeStats);

        return true;
    }

    getUpgradeStats(tower) {
        const config = towerConfigs[tower.type];
        return {
            damage: tower.damage * 1.5,
            range: tower.range * 1.2,
            attackSpeed: tower.attackSpeed * 1.2,
            color: config.color,
            upgradeCost: config.upgradeCost * 1.5
        };
    }

    getTowerCost(type) {
        return towerConfigs[type]?.cost || 0;
    }

    getUpgradeCost(tower) {
        return towerConfigs[tower.type]?.upgradeCost || 0;
    }
}