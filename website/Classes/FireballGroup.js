class FireballGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene){
        super(scene.physics.world, scene);

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

    shootFireball(x, y){
        const fireball = this.getFirstDead(false);
        if (fireball) {
            fireball.fire(x, y);
        }
    }
}