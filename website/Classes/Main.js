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
        this.load.image('bird', 'resources/angry-bird.png');
        this.load.image('invincibleBird', 'resources/invincible-bird.png');
        this.load.image('pipe', 'resources/pipe.png');
        this.load.image('pickup', 'resources/pickup.png');
        this.load.image('background', 'resources/background.png');
    }

    //Initializes the assets in the game
    //And places them on the canvas
    create() {

        //Setting the background
        this.add.image(160, 240, 'background');

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

    //Constantly refreshes
    //These are technically the events that happen in the game
    update() {
        if (this.cursors.left.isDown) {

        }

        //Clean this up
        this.physics.world.overlap(this.bird, this.pipes.pipeGroup, function () {
            this.die();
        }, null, this);

        this.physics.world.overlap(this.bird, this.pickups.pickupGroup, this.pickupObjects, null, this);

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

        //Iterate through the pickups to check if they are out of the screen
        this.pickups.pickupGroup.getChildren().forEach(function (pickup) {
            this.pickups.addPickup(pickup);

            if (pickup.getBounds().right < 0) {

                //If pickup is out of the screen render a new one
                this.pickups.renderPickups(this.pipes.pipeXPosition);
            }
        }, this)
    }

    //t
    pickupObjects(bird, pickup) {
        this.pickupHandler(this.pickups.generatePickupType())
        console.log(this.pickups.generatePickupType());
        pickup.disableBody(true, true);

        this.pickups.pickupGroup.children.iterate(function (child) {
            console.log("yellow picked up");
            child.enableBody(true, 350 * Phaser.Math.Between(2, 4), Phaser.Math.Between(20, game.config.height - 20), true, true);
            child.setVelocityX(-(125));
        });
    }


    //End and restart the game
    async die() {

        //If the player has no life points left the game is over
        if (!this.bird.PlayerInvincible) {
            localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
            this.scene.start('PlayGame');
        }
        //If the player has one lifepoint it will be taken once he's out of the wall
        else {
            //Little cheating here
            //Could not find an "overlap-en" event therefore resetting the skin is on a timer
            var that = this;
            setTimeout(function () {
                that.bird.PlayerInvincible = false;
                that.bird.setTexture('bird');
            }, 800);
        }
    }


    pickupHandler(pickupType) {
        switch (pickupType) {
            case 'Slow':
                this.slowGame();
                break;
            case 'Fast':
                this.fastenGame();
                break;
            case 'Mirror':
                this.mirrorGame();
                break;
            case 'Health':
                this.healthHandler();
                break;
        }
    }

    //Slows the game
    slowGame() {
        this.pipes.setSpeed((this.bird.playerSpeed) - 45);
        this.pickups.setSpeed((this.bird.playerSpeed) - 45);

        //Resets the speed to normal
        //setTimeout 'this.'' is not the same as Main 'this.'
        //Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.pipes.setSpeed(that.bird.playerSpeed);
            that.pickups.setSpeed(that.bird.playerSpeed);
        }, 6000);
    }

    //Fastens the game
    fastenGame() {
        this.pipes.setSpeed((this.bird.playerSpeed) + 100);
        this.pickups.setSpeed((this.bird.playerSpeed) + 100);

        //Resets the speed to normal
        //setTimeout 'this.'' is not the same as Main 'this.'
        //Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.pipes.setSpeed(that.bird.playerSpeed);
            that.pickups.setSpeed(that.bird.playerSpeed);
        }, 10000);
    }

    //Mirror game
    //Not yet functional
    mirrorGame() {
        this.pipes.setSpeed(-(this.bird.playerSpeed));

        //Resets the speed to normal
        //setTimeout 'this.'' is not the same as Main 'this.'
        //Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.pipes.setSpeed(that.bird.playerSpeed);
        }, 6000);
    }

    //Sets the health value
    healthHandler() {
        if (!this.bird.PlayerInvincible) {
            this.bird.PlayerInvincible = true;
            this.bird.setTexture('invincibleBird');
        }
    }
}