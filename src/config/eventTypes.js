export const GameEvents = {    

    LEADERBOARD_UPDATED: 'leaderboard:updated',
    SCORE_SAVED: 'score:saved',
    
    // Enemy related events
    ENEMY_CREATED: 'enemy:created',
    ENEMY_SPAWNED: 'enemy:spawned',
    ENEMY_DIED: 'enemy:died',
    ENEMY_DAMAGED: 'enemy:damaged',
    ENEMY_REACHED_CORE: 'enemy:reachedCore',
    ENEMY_INITIALIZED: 'enemy:initialized',
    ENEMY_CREATION_REQUESTED: 'enemy:creationRequested',
    ENEMY_CREATION_FAILED: 'enemy:creationFailed',  

    // Core related events
    CORE_DAMAGED: 'core:damaged',
    CORE_DESTROYED: 'core:destroyed',
    CORE_HEALED: 'core:healed',

    // Game state events
    GAME_PREPARATION_STARTED: 'game:preparationStarted',
    PREPARATION_COMPLETED: 'game:preparationCompleted',
    GAME_START_REQUESTED: 'game:startRequested',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',

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
    WAVE_NUMBER_UPDATED: 'wave:numberUpdated',
    TUTORIAL_REQUESTED: 'tutorial:requested',
    RETURN_TO_MENU_REQUESTED: 'menu:returnRequested',

    // Health related events
    HEALTH_INITIALIZED: 'health:initialized',
    HEALTH_CHANGED: 'health:changed',
    HEALTH_DEPLETED: 'health:depleted',
    HEALTH_SET: 'health:set',
    MAX_HEALTH_CHANGED: 'health:maxChanged',

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

    TOWER_TYPE_SELECTED: 'TOWER_TYPE_SELECTED',
    TOWER_SELECTED: 'TOWER_SELECTED',
    UI_INITIALIZED: 'UI_INITIALIZED',
};