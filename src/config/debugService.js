import { DEBUG_CONFIG, DebugUtils, DEBUG_CATEGORIES } from '../config/debugConfig.js';
import { eventManager } from '../managers/eventManager.js';
import { GameEvents } from '../config/eventTypes.js';

export class DebugService {
    constructor() {
        this.setupKeyboardShortcuts();
        this.setupEventListeners();
        
        if (DEBUG_CONFIG.enabled) {
            console.log('Debug mode enabled', DEBUG_CONFIG);
        }
    }

    setupKeyboardShortcuts() {
        if (!DEBUG_CONFIG.enabled) return;

        window.addEventListener('keydown', (e) => {
            // Only handle debug keys if debug mode is enabled
            if (!DEBUG_CONFIG.enabled) return;

            switch(e.key.toLowerCase()) {
                case 't':  // Test enemy spawns
                    if (DebugUtils.shouldDebug(DEBUG_CATEGORIES.SYSTEMS, 'enemy')) {
                        DebugUtils.log(DEBUG_CATEGORIES.SYSTEMS, 'Testing enemy spawns');
                        eventManager.emit(GameEvents.ENEMY_CREATION_REQUESTED, {
                            type: 'GRUNT',
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight
                        });
                    }
                    break;
                    
                case 'r':  // Toggle tower ranges
                    if (DebugUtils.shouldDebug(DEBUG_CATEGORIES.SYSTEMS, 'tower')) {
                        DEBUG_CONFIG.systems.tower.showRange = !DEBUG_CONFIG.systems.tower.showRange;
                        DebugUtils.log(DEBUG_CATEGORIES.SYSTEMS, 
                            `Tower ranges ${DEBUG_CONFIG.systems.tower.showRange ? 'enabled' : 'disabled'}`);
                    }
                    break;

                case 'g':  // Toggle grid coordinates
                    if (DebugUtils.shouldDebug(DEBUG_CATEGORIES.SYSTEMS, 'grid')) {
                        DEBUG_CONFIG.systems.grid.showCoordinates = !DEBUG_CONFIG.systems.grid.showCoordinates;
                        DebugUtils.log(DEBUG_CATEGORIES.SYSTEMS, 
                            `Grid coordinates ${DEBUG_CONFIG.systems.grid.showCoordinates ? 'enabled' : 'disabled'}`);
                    }
                    break;

                case 'p':  // Toggle performance monitoring
                    if (DEBUG_CONFIG.enabled) {
                        DEBUG_CONFIG.performance.enabled = !DEBUG_CONFIG.performance.enabled;
                        DebugUtils.log('performance', 
                            `Performance monitoring ${DEBUG_CONFIG.performance.enabled ? 'enabled' : 'disabled'}`);
                    }
                    break;
            }
        });
    }

    setupEventListeners() {
        if (!DEBUG_CONFIG.enabled) return;

        // Monitor certain game events for debugging
        if (DEBUG_CONFIG.systems.enemy.enabled) {
            eventManager.subscribe(GameEvents.ENEMY_SPAWNED, (data) => {
                DebugUtils.log(DEBUG_CATEGORIES.SYSTEMS, 'Enemy spawned', data);
            });
        }

        if (DEBUG_CONFIG.systems.tower.enabled) {
            eventManager.subscribe(GameEvents.TOWER_PLACED, (data) => {
                DebugUtils.log(DEBUG_CATEGORIES.SYSTEMS, 'Tower placed', data);
            });
        }

        if (DEBUG_CONFIG.ui.enabled) {
            eventManager.subscribe(GameEvents.STATE_CHANGED, (data) => {
                DebugUtils.log(DEBUG_CATEGORIES.UI, 'State changed', data);
            });
        }
    }

    // Performance monitoring
    logPerformance(deltaTime, entityCounts) {
        if (!DEBUG_CONFIG.performance.enabled) return;
        
        DebugUtils.incrementFrame();
        
        if (DebugUtils.shouldLogFrame()) {
            const fps = Math.round(1000 / deltaTime);
            const memory = window.performance.memory ? {
                totalJSHeapSize: Math.round(window.performance.memory.totalJSHeapSize / 1048576),
                usedJSHeapSize: Math.round(window.performance.memory.usedJSHeapSize / 1048576)
            } : 'Not available';

            DebugUtils.log('performance', 'Performance Stats', {
                fps,
                memory,
                entities: entityCounts
            });
        }
    }
}