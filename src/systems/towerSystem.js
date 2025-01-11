import { Container, Graphics } from 'pixi.js';
import { Tower } from '../components/tower.js';
import { TOWER_CONFIG, GRID_CONFIG } from '../config/gameConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class TowerSystem {
    constructor(gridSystem, energyCore) {
        this.container = new Container();
        this.gridSystem = gridSystem;
        this.energyCore = energyCore;
        this.towers = new Map(); // Grid position string to Tower instance
        this.energyBeams = new Graphics();
        this.placementPreview = new Graphics();
        
        // Add visual layers in correct order
        this.container.addChild(this.energyBeams);
        this.container.addChild(this.placementPreview);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for core destruction
        eventManager.subscribe(GameEvents.CORE_DESTROYED, () => {
            this.handleCoreDestroyed();
        });

        // Listen for tower events
        eventManager.subscribe(GameEvents.TOWER_PLACED, (data) => {
            if (data) this.updateEnergyConnections();
        });

        eventManager.subscribe(GameEvents.TOWER_DESTROYED, (data) => {
            if (data) this.updateEnergyConnections();
        });

        // Listen for game state changes
        eventManager.subscribe(GameEvents.GAME_OVER, () => {
            this.handleCoreDestroyed();
        });
    }

    canPlaceTower(gridX, gridY) {
        const posKey = `${gridX},${gridY}`;
        
        // Check if position is already occupied
        if (this.towers.has(posKey)) return false;

        // Check distance from core
        const corePos = this.gridSystem.pixelToGrid(
            this.energyCore.container.position.x,
            this.energyCore.container.position.y
        );
        const distanceToCore = Math.sqrt(
            Math.pow(gridX - corePos.x, 2) + 
            Math.pow(gridY - corePos.y, 2)
        );
        if (distanceToCore < TOWER_CONFIG.PLACEMENT_RULES.MIN_DISTANCE_FROM_CORE) return false;

        // Check distance from other towers
        for (const [pos, tower] of this.towers) {
            const [tX, tY] = pos.split(',').map(Number);
            const distance = Math.sqrt(
                Math.pow(gridX - tX, 2) + 
                Math.pow(gridY - tY, 2)
            );
            if (distance < TOWER_CONFIG.PLACEMENT_RULES.MIN_DISTANCE_BETWEEN_TOWERS) return false;
        }

        return true;
    }

    placeTower(gridX, gridY) {
        if (!this.canPlaceTower(gridX, gridY)) {
            eventManager.emit(GameEvents.TOWER_PLACEMENT_FAILED, {
                position: { x: gridX, y: gridY },
                reason: 'invalid_position'
            });
            return null;
        }

        const tower = new Tower(gridX, gridY);
        this.towers.set(`${gridX},${gridY}`, tower);
        this.container.addChild(tower.container);
        
        this.updateEnergyConnections();
        return tower;
    }

    updateEnergyConnections() {
        // Clear existing energy beams
        this.energyBeams.clear();
        this.energyBeams
            .setStrokeStyle({
                width: 2,
                color: 0x3498db,
                alpha: 0.5
            });

        const corePos = {
            x: this.energyCore.container.position.x,
            y: this.energyCore.container.position.y
        };

        // Reset all towers to disconnected
        for (const tower of this.towers.values()) {
            tower.setConnected(false);
        }

        // Start with towers in range of the core
        const connectedTowers = new Set();
        for (const tower of this.towers.values()) {
            const towerPos = tower.getPosition();
            const distance = Math.sqrt(
                Math.pow(towerPos.x - corePos.x, 2) + 
                Math.pow(towerPos.y - corePos.y, 2)
            );

            if (distance <= TOWER_CONFIG.ENERGY_CONNECTION_RANGE * GRID_CONFIG.CELL_SIZE) {
                tower.setConnected(true);
                connectedTowers.add(tower);
                
                // Draw energy beam
                this.energyBeams
                    .moveTo(corePos.x, corePos.y)
                    .lineTo(towerPos.x, towerPos.y)
                    .stroke();
            }
        }

        // Propagate energy through connected towers
        let newConnections = true;
        while (newConnections) {
            newConnections = false;
            
            for (const tower of this.towers.values()) {
                if (connectedTowers.has(tower)) continue;

                const towerPos = tower.getPosition();
                // Check if in range of any connected tower
                for (const connectedTower of connectedTowers) {
                    const connectedPos = connectedTower.getPosition();
                    const distance = Math.sqrt(
                        Math.pow(towerPos.x - connectedPos.x, 2) + 
                        Math.pow(towerPos.y - connectedPos.y, 2)
                    );

                    if (distance <= TOWER_CONFIG.ENERGY_CONNECTION_RANGE * GRID_CONFIG.CELL_SIZE) {
                        tower.setConnected(true);
                        connectedTowers.add(tower);
                        newConnections = true;
                        
                        // Draw energy beam
                        this.energyBeams
                            .moveTo(connectedPos.x, connectedPos.y)
                            .lineTo(towerPos.x, towerPos.y)
                            .stroke();
                        break;
                    }
                }
            }
        }

        // Emit network update event
        eventManager.emit(GameEvents.TOWER_NETWORK_UPDATED, {
            connectedCount: connectedTowers.size,
            totalTowers: this.towers.size
        });
    }

    showPlacementPreview(gridX, gridY, isValid) {
        // Convert grid position to pixel position, centering in the cell
        const pixelPos = {
            x: gridX * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2,
            y: gridY * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2
        };
        
        this.placementPreview.clear()
            .rect(
                pixelPos.x - GRID_CONFIG.CELL_SIZE * 0.4,  // Center horizontally
                pixelPos.y - GRID_CONFIG.CELL_SIZE * 0.4,  // Center vertically
                GRID_CONFIG.CELL_SIZE * 0.8,
                GRID_CONFIG.CELL_SIZE * 0.8
            )
            .fill({ color: isValid ? 0x2ecc71 : 0xe74c3c, alpha: 0.3 })
            .setStrokeStyle({
                width: 2,
                color: isValid ? 0x2ecc71 : 0xe74c3c,
                alpha: 0.5
            })
            .stroke();
    }

    hidePlacementPreview() {
        this.placementPreview.clear();
    }

    handleCoreDestroyed() {
        // Disconnect all towers when core is destroyed
        for (const tower of this.towers.values()) {
            tower.setConnected(false);
        }
        this.energyBeams.clear();
    }

    update(time, enemies) {
        for (const tower of this.towers.values()) {
            tower.update(time, enemies);
        }
    }

    destroy() {
        for (const tower of this.towers.values()) {
            tower.destroy();
        }
        this.towers.clear();
        this.container.destroy();
    }
}