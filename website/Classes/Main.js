var game;
var gameOptions = {
    localStorageName: 'bestFlappyScore'
};

class Main extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    //Loading the assets used in the game
    preload() {
        this.load.image('bird', 'resources/bird.png');
        this.load.image('pipe', 'resources/pipe.png');
    }

    //Initializes the assets in the game
    //And places them on the canvas
    create() {
        //Input keys
        this.cursors = this.input.keyboard.createCursorKeys();

        //Creating the bird
        this.bird = new Player(this, 80, game.config.height / 2, 'bird');

        //Creating pipes
        this.pipes = new Pipes(this);
        this.pipes.setSpeed(this.bird.playerSpeed);

        //Creating pickups
        this.pickups = new Pickups(this);
        this.pickups.setSpeed(this.bird.playerSpeed);

        //Event listener for click
        this.input.on('pointerdown', this.flap, this);

        //Score counter
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);
    }

    //Can't delete it for now have to figure out why
    flap() {
        this.bird.ascend();
    }

    updateScore(inc) {
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }

    update() {
        if (this.cursors.left.isDown) {
            this.pipes.setSpeed(((this.bird.playerSpeed) + 100));
            this.pickups.setSpeed(((this.bird.playerSpeed) + 100));

            //Resets the speed to normal
            //setTimeout 'this.'' is not the same as Main 'this.'
            //Therefore have to save it in a variable and use that
            var that = this;
            setTimeout(function () {
                that.pipes.setSpeed(that.bird.playerSpeed);
                that.pickups.setSpeed(that.bird.playerSpeed)
            }, 3000);
        }

        //Clean this up
        this.physics.world.collide(this.bird, this.pipes.pipeGroup, function () {
            this.die();
        }, null, this);

        this.physics.world.overlap(this.bird, this.pickups.pickupGroup, this.pickupObject , null, this);

        

        if (this.bird.y > game.config.height || this.bird.y < 0) {
            this.die();
        }

        //Clean this up
        this.pipes.pipeGroup.getChildren().forEach(function (pipe) {
            if (pipe.getBounds().right < 0) {
                this.pipes.addPipe(pipe);

                if (this.pipes.pipePool.length == 2) {
                    this.pipes.placePipes();

                    this.updateScore(1);
                }
            }
        }, this)

        this.pickups.pickupGroup.getChildren().forEach(function (pickup) {
            this.pickups.addPickup(pickup);

            if (pickup.getBounds().right < 0) {
                this.pickups.renderPickups(this.pipes.pipeXPosition);
            }
        }, this)
    }

    pickupObject(bird, pickup)
    {
        console.log(pickup.pickupType);
        pickup.disableBody(true, true);  
        console.log(this.pickups.generatePickupType());    
        
    }

    //End and restart the game
    die() {
        localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
        this.scene.start('PlayGame');
    }
}