export const TowerTypes = {
    BASIC: 'BASIC',
    RAPID: 'RAPID',
    SNIPER: 'SNIPER',
    AOE: 'AOE'    // Area of Effect
};

export const TowerConfigs = {
    [TowerTypes.BASIC]: {
        damage: 20,
        range: 3,
        attackSpeed: 1,
        cost: 100,
        color: 0x3498db,
        upgradeCost: 75,
        upgradeMultipliers: {
            damage: 1.5,
            range: 1.2,
            attackSpeed: 1.2,
            upgradeCost: 1.5
        }
    },
    [TowerTypes.RAPID]: {
        damage: 10,
        range: 2,
        attackSpeed: 2,
        cost: 150,
        color: 0x2ecc71,
        upgradeCost: 100,
        upgradeMultipliers: {
            damage: 1.3,
            range: 1.1,
            attackSpeed: 1.4,
            upgradeCost: 1.5
        }
    },
    [TowerTypes.SNIPER]: {
        damage: 50,
        range: 5,
        attackSpeed: 0.5,
        cost: 200,
        color: 0xe74c3c,
        upgradeCost: 150,
        upgradeMultipliers: {
            damage: 1.7,
            range: 1.3,
            attackSpeed: 1.1,
            upgradeCost: 1.5
        }
    },
    [TowerTypes.AOE]: {
        damage: 15,
        range: 2.5,
        attackSpeed: 0.8,
        cost: 250,
        color: 0x9b59b6,
        upgradeCost: 175,
        upgradeMultipliers: {
            damage: 1.4,
            range: 1.2,
            attackSpeed: 1.2,
            upgradeCost: 1.5
        }
    }
};