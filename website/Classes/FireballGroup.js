class FireballGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        // Create multiple fireball objects
        this.createMultiple({
            classType: Fireball,
            frameQuantity: 10,
            active: false,
            visible: false,
            setXY: {
                x: -1500,
                y: -1500
            },
            key: 'fireball'
        })
    }

    // Calls the shoot method for the first ammo in the pool
    shootFireball(x, y, goingLeft) {
        const fireball = this.getFirstDead(false);
        if (fireball) {
            fireball.fire(x, y, goingLeft);
        }
    }
}