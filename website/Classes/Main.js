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
        this.load.image('ammo', 'resources/ammo.png');
        this.load.image('noAmmo', 'resources/noAmmo.png');
        this.load.image('fireball', 'resources/fireball.png');
    }

    //Initializes the assets in the game
    //And places them on the canvas
    create() {

        //Setting the background
        this.add.image(160, 240, 'background');

        //Mouse keys
        this.cursors = this.input.keyboard.createCursorKeys();

        //Keyboard keys
        this.inputKeys = [];
        this.inputKeys.push(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))

        //Creating the bird
        this.bird = new Player(this, 80, game.config.height / 2, 'bird');

        //Creating pickups
        this.pickups = new Pickups(this);
        this.pickups.setSpeed(this.bird.playerSpeed);

        //Creating pipes
        this.pipes = new Pipes(this);
        this.pipes.setSpeed(this.bird.playerSpeed);

        //Adding fireballs
        this.fireballs = new FireballGroup(this);

        //Add ammo icon
        this.add.image(20, 60, 'noAmmo');
        this.ammo = this.add.image(20, 60, 'ammo');

        //Hiding the ammo icon
        this.ammo.visible = false;

        //Event listener for click
        this.input.on('pointerdown', this.flap, this);

        //Score counter
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);

        //Ammo counter
        this.ammoText = this.add.text(30, 70, '');
        this.updateAmmo();
    }

    //Can't delete it for now have to figure out why
    flap() {
        this.bird.ascend();
    }

    //Updates the textfield with the score
    updateScore(inc) {
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }

    //Updates the textfield with the ammo
    updateAmmo() {
        this.ammoText.text = this.bird.PlayerAmmo;
    }

    //Constantly refreshes
    //These are technically the events that happen in the game
    update() {

        //Shooting the fireball if space is pressed
        this.inputKeys.forEach(key => {
            if (Phaser.Input.Keyboard.JustDown(key)) {
                //Only shoot if the player has ammo
                if (this.bird.PlayerAmmo > 0) {
                    this.fireballs.shootFireball(this.bird.x, this.bird.y);
                    this.bird.PlayerAmmo--;

                    if (this.bird.PlayerAmmo == 0) {
                        this.ammo.visible = false;
                    }

                    this.updateAmmo();
                }
            }
        });

        //Collider for bird and pipes
        this.physics.world.overlap(this.bird, this.pipes.pipeGroup, function () {
            this.die();
        }, null, this);

        //Collider for bird pickups
        this.physics.world.overlap(this.bird, this.pickups.pickupGroup, this.pickupObjects, null, this);

        //Collider for fireballs and pipes
        this.physics.world.overlap(this.fireballs, this.pipes.pipeGroup, this.shootPipes , null, this);

        //If the player leaves the screen the bird dies
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

    //Picking up the mistery boxes
    pickupObjects(bird, pickup) {
        //Generate a random pickup type and pass it to the handler
        this.pickupHandler(this.pickups.generatePickupType());

        //Make the box disappear
        pickup.disableBody(true, true);

        //Randomly spawn another pickup
        this.pickups.pickupGroup.children.iterate(function (child) {
            child.enableBody(true, 350 * Phaser.Math.Between(2, 4), Phaser.Math.Between(20, game.config.height - 20), true, true);
            child.setVelocityX(-(125));
        });
    }

    shootPipes(ammo, pipe) {
        console.log('Triggered');
        pipe.disableBody(true, true);     
        ammo.disableBody(true, true);    
        ammo.enableBody(true, 500,500, true, true);
    }

    //End and restart the game
    die() {

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

    //Calls the respective function based on the randomly generated pickup type
    pickupHandler(pickupType) {
        switch (pickupType) {
            case 'Slow':
                this.slowGame();
                break;
            case 'Fast':
                this.fastenGame();
                break;
            case 'Ammo':
                this.ammoHandler();
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

        var that = this;

        //Resets the speed to normal
        //setTimeout 'this.'' is not the same as Main 'this.'
        //Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.pipes.setSpeed(that.bird.playerSpeed);
            that.pickups.setSpeed(that.bird.playerSpeed);
        }, 6000);
    }

    ammoHandler() {
        this.bird.PlayerAmmo++;
        this.ammo.visible = true;
        console.log(this.bird.PlayerAmmo);

        this.updateAmmo();
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