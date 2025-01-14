import { Movement } from '../movement.js';

export class EnemyMovement {
    constructor(container) {
        this.movement = new Movement(container);
    }

    setSpeed(speed) {
        this.movement.setSpeed(speed);
    }

    moveTowards(targetX, targetY) {
        this.movement.moveTowards(targetX, targetY);
 
    }

    update() {
        this.movement.update();
    }

    getPosition() {
        return this.movement.getPosition();
    }
}