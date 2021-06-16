class Fireball extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super(scene, x, y, 'fireball');
    }

    fire(x, y){
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(300);
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta);

        if (this.x >= 320){
            this.setActive(false);
            this.setVisible(false);
        }
    }
}