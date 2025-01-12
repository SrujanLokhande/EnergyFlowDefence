export const GameEvents = {    
    // Enemy related events
    ENEMY_CREATED: 'enemy:created',
    ENEMY_SPAWNED: 'enemy:spawned',
    ENEMY_DIED: 'enemy:died',
    ENEMY_MOVED: 'enemy:moved',
    ENEMY_DAMAGED: 'enemy:damaged',
    ENEMY_DESTROYED: 'enemy:destroyed', 
    ENEMY_REACHED_CORE: 'enemy:reachedCore',
    ENEMY_INITIALIZED: 'enemy:initialized',
    ENEMY_CREATION_REQUESTED: 'enemy:creationRequested',
    ENEMY_CREATION_FAILED: 'enemy:creationFailed',
    ENEMY_CONFIGURE_HEALTH: 'enemy:configureHealth',
    ENEMY_CONFIGURE_MOVEMENT: 'enemy:configureMovement',
    ENEMY_CONFIGURE_VISUALS: 'enemy:configureVisuals',    

    // Tower related events
    TOWER_PLACED: 'tower:placed',
    TOWER_SOLD: 'tower:sold',
    TOWER_ATTACKED: 'tower:attacked',
    TOWER_UPGRADED: 'tower:upgraded',
    TOWER_DESTROYED: 'tower:destroyed',
    TOWER_CONNECTION_CHANGED: 'tower:connectionChanged',
    TOWER_NETWORK_UPDATED: 'tower:networkUpdated',
    TOWER_PLACEMENT_FAILED: 'tower:placementFailed',
    TOWER_TARGET_ACQUIRED: 'tower:targetAcquired',
    TOWER_TARGET_LOST: 'tower:targetLost',
    TOWER_HIT_TARGET: 'tower:hitTarget',

    // Core related events
    CORE_DAMAGED: 'core:damaged',
    CORE_DESTROYED: 'core:destroyed',
    CORE_HEALED: 'core:healed',

    // Game state events
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',
    WAVE_STARTED: 'wave:started',
    WAVE_COMPLETED: 'wave:completed',

    // Resource events
    RESOURCES_CHANGED: 'resources:changed',
    RESOURCES_COLLECTED: 'resources:collected',

    // Player events
    PLAYER_MOVED: 'player:moved',
    PLAYER_ACTION: 'player:action',

    // State events
    STATE_CHANGED: 'state:changed',
    MENU_ENTERED: 'menu:entered',
    SCORE_UPDATED: 'score:updated',

    // Health related events
    HEALTH_INITIALIZED: 'health:initialized',
    HEALTH_CHANGED: 'health:changed',
    HEALTH_DEPLETED: 'health:depleted',
    HEALTH_SET: 'health:set',
    MAX_HEALTH_CHANGED: 'health:maxChanged',
};