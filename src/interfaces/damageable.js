import { Health } from '../components/health.js';
// This will serve as our interface definition
export class Damageable {
    // Interface methods that must be implemented
    static implementsInterface(obj) {
        return (
            obj.health instanceof Health &&
            typeof obj.takeDamage === 'function' &&
            typeof obj.getHealth === 'function' &&
            typeof obj.isDead === 'function'
        );
    }
}

// Helper function to check if an entity is damageable
export function isDamageable(entity) {
    return Damageable.implementsInterface(entity);
}