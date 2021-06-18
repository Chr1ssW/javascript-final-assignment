class Fireball extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super(scene, x, y, 'fireball');
    }

    // Fires the actual bullet
    fire(x, y, goingLeft){
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        // Decides which way to shoot
        if (goingLeft){
            this.setVelocityX(-300);
        }else{
            this.setVelocityX(300);
        }

        
    }

    preUpdate(time, delta){
        super.preUpdate(time, delta);

        if (this.x >= 320){
            this.setActive(false);
            this.setVisible(false);
        }
    }
}