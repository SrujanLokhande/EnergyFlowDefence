export const GameEvents = {    
    // Leaderboard events
    LEADERBOARD_UPDATED: 'leaderboard:updated',
    SCORE_SAVED: 'score:saved',
    
    // Enemy related events
    ENEMY_CREATED: 'enemy:created',
    ENEMY_SPAWNED: 'enemy:spawned',
    ENEMY_DIED: 'enemy:died',
    ENEMY_DAMAGED: 'enemy:damaged',
    ENEMY_REACHED_CORE: 'enemy:reachedCore',   
    ENEMY_CREATION_REQUESTED: 'enemy:creationRequested',
    
    // Core related events
    CORE_DAMAGED: 'core:damaged',
    CORE_DESTROYED: 'core:destroyed',

    // Game state events
    GAME_PREPARATION_STARTED: 'game:preparationStarted',    
    GAME_START_REQUESTED: 'game:startRequested',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',

    // Resource events
    RESOURCES_CHANGED: 'resources:changed',

    // State events
    STATE_CHANGED: 'state:changed',
    MENU_ENTERED: 'menu:entered',
    SCORE_UPDATED: 'score:updated',
    WAVE_NUMBER_UPDATED: 'wave:numberUpdated',
    TUTORIAL_REQUESTED: 'tutorial:requested',
    RETURN_TO_MENU_REQUESTED: 'menu:returnRequested',
    GAME_RESTART_REQUESTED: 'game:restartRequested',

    // Health related events
    HEALTH_CHANGED: 'health:changed',
    HEALTH_DEPLETED: 'health:depleted',

    // Tower related events
    TOWER_PLACED: 'tower:placed',
    TOWER_CREATION_REQUESTED: 'tower:creationRequested',
    TOWER_CONFIGURE: 'tower:configure',
    TOWER_ATTACKED: 'tower:attacked',
    TOWER_UPGRADED: 'tower:upgraded',
    TOWER_DESTROYED: 'tower:destroyed',
    TOWER_NETWORK_UPDATED: 'tower:networkUpdated',
    TOWER_PLACEMENT_FAILED: 'tower:placementFailed',
    TOWER_HIT_TARGET: 'tower:hitTarget',

    // Wave Management events
    WAVE_START_REQUESTED: 'wave:startRequested',
    WAVE_STARTED: 'wave:started',
    WAVE_ENEMY_SPAWNED: 'wave:enemySpawned',
    WAVE_COMPLETED: 'wave:completed',
    WAVE_COUNTDOWN_STARTED: 'wave:countdownStarted',
    TOWER_TYPE_SELECTED: 'tower:typeSelected'  // Fixed naming convention
};