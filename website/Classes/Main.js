var game;
var gameOptions = {
    localStorageName: 'bestFlappyScore'
};

class Main extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    // Loading the assets used in the game
    preload() {
        this.load.image('bird', 'resources/angry-bird.png');
        this.load.image('invincibleBird', 'resources/invincible-bird.png');
        this.load.image('upperPipe', 'resources/topPipe.png');
        this.load.image('bottomPipe', 'resources/bottomPipe.png');
        this.load.image('pickup', 'resources/pickup.png');
        this.load.image('background', 'resources/background.png');
        this.load.image('ammo', 'resources/ammo.png');
        this.load.image('noAmmo', 'resources/noAmmo.png');
        this.load.image('fireball', 'resources/fireball.png');

        // Loading audio
        this.load.audio('fireball', 'resources/audio/fireball.mp3');
        this.load.audio('dieAudio', 'resources/audio/dieAudio.mp3');
        this.load.audio('explosion', 'resources/audio/explosion.mp3');
        this.load.audio('flap', 'resources/audio/flap.mp3');
        this.load.audio('pickupSound', 'resources/audio/pickup.mp3');
    }

    // Initializes the assets in the game
    // And places them on the canvas
    create() {

        // Creating sound variables
        this.fireball = this.sound.add('fireball');
        this.dieAudio = this.sound.add('dieAudio');
        this.explosion = this.sound.add('explosion');
        this.flapSound = this.sound.add('flap');
        this.pickupSound = this.sound.add('pickupSound');
        this.dieAudio.volume = 0.2;
        this.explosion.volume = 0.3;
        this.flapSound.volume = 0.3;
        this.pickupSound.volume = 0.3;

        this.pipeGenerateEvent;

        // Setting the background
        this.add.image(160, 240, 'background');

        // Adding pipes
        this.upperPipes = this.physics.add.group();
        this.lowerPipes = this.physics.add.group();

        // Mouse keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Keyboard keys
        this.inputKeys = [];
        this.inputKeys.push(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))

        // Creating the bird
        this.bird = new Player(this, 100, game.config.height / 2, 'bird');
        this.bird.setOrigin(0.5);

        // Being updated needs to be preserved
        this.pipeVelocity = this.bird.playerSpeed;
        // If true pipes move
        this.isMoving = false;
        this.isMovingUp = true;
        this.goingLeft = false;

        // Creating pickups
        this.pickups = new Pickups(this);
        this.pickups.setSpeed(this.bird.playerSpeed);

        // Adding fireballs
        this.fireballs = new FireballGroup(this);

        // Add ammo icon
        this.add.image(20, 60, 'noAmmo');
        this.ammo = this.add.image(20, 60, 'ammo');

        // Event listener for click
        this.input.on('pointerdown', this.flap, this);

        // Score counter
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);

        // Ammo counter
        this.ammoText = this.add.text(30, 70, '');
        this.updateAmmo();

        // Spawn pipes
        this.spawnPipes();
    }

    // Timer that spawns the pipes
    spawnPipes() {
        this.pipeGenerateEvent = this.time.addEvent({
            delay: 1500,
            callback: this.generatePipes,
            callbackScope: this,
            loop: true
        });
    }

    // Generates the pipes
    generatePipes() {
        // Randomly picking the size of the gap
        let gap = Phaser.Math.Between(100, 120);

        // Selecting a random number between 1 and 6
        // If it is 1 then the gap will be 0 and the player has to shoot
        // Doesn't spawn if user has no ammo
        let fate = Phaser.Math.Between(1, 10);
        if (fate == 1 && !this.goingLeft) {
            gap = 0;
        }

        // Minimum distance has to be at least 320
        let distance = 320 + gap;

        // Picking the hole position
        // This is the middle of the gap
        let pipeHolePosition = Phaser.Math.Between(130, 330);


        let lowerY = pipeHolePosition + distance / 2;
        let upperY = pipeHolePosition - distance / 2;

        this.placePipe('upperPipe', upperY);
        this.placePipe('bottomPipe', lowerY);

        // Need to check both the get points if the user destroys one of them
        var upperFirst = this.upperPipes.getFirstAlive();
        var lowerFirst = this.lowerPipes.getFirstAlive();
        if (upperFirst != null || lowerFirst != null) {
            // If the user passes the pipes increase the score
            // If the user shoots both pipes no score is given
            if (upperFirst.x < this.bird.x || lowerFirst.x < this.bird) {
                this.updateScore(1);
            }
        }

        // Switching the value to its opposite
        this.isMovingUp = this.isMovingUp ? false : true;
    }

    // Places the pipes on the screen
    placePipe(skin, y) {

        let spawn = 500;
        let speed = -this.pipeVelocity;

        if (this.goingLeft) {
            spawn = -50;
            speed = this.pipeVelocity;
        }

        if (skin === 'upperPipe') {
            this.upperPipes.create(spawn, y, skin);
            this.upperPipes.setVelocityX(speed);
        } else {
            this.lowerPipes.create(spawn, y, skin);
            this.lowerPipes.setVelocityX(speed);
            console.log(this.pipeVelocity);
        }

        // console.log(this.isMoving);
        // Moving the pipes up and down
        let direction = 0;
        if (this.isMoving) {
            console.log(this.isMovingUp);
            if (this.isMovingUp) {
                direction = -50;
            } else {
                direction = 50;
            }

            this.upperPipes.setVelocityY(direction);
            this.lowerPipes.setVelocityY(direction);
        }
    }

    // Can't delete it for now have to figure out why
    flap() {
        this.bird.ascend();
        this.flapSound.play();
    }

    // Updates the textfield with the score
    updateScore(inc) {
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }

    // Updates the textfield with the ammo
    updateAmmo() {
        this.ammoText.text = this.bird.PlayerAmmo;
    }

    // Constantly refreshes
    // These are technically the events that happen in the game
    update() {

        // Deleting pipes if they leave the screen to free up memory
        var upperFirst = this.upperPipes.getFirstAlive();
        var lowerFirst = this.lowerPipes.getFirstAlive();

        if (upperFirst != null && lowerFirst != null) {
            // Delete pipes if they are leaving the screen on the right but only when the player is going left
            // Delete pipes if they are leaving the screen on the left but only when the player is going right
            // Otherwise no pipes would ever spawn
            if ((upperFirst.x < - 40 && !this.goingLeft) || ((upperFirst.x > game.config.width + 40) && this.goingLeft)) {
                upperFirst.destroy();
            }

            if ((lowerFirst.x < - 40 && !this.goingLeft) || ((lowerFirst.x > game.config.width + 40) && this.goingLeft)) {
                lowerFirst.destroy();
            }
        }

        // Shooting the fireball if space is pressed
        this.inputKeys.forEach(key => {
            if (Phaser.Input.Keyboard.JustDown(key)) {
                // Only shoot if the player has ammo
                if (this.bird.PlayerAmmo > 0) {
                    this.fireballs.shootFireball(this.bird.x, this.bird.y, this.goingLeft);
                    this.fireball.play();
                    this.bird.PlayerAmmo--;

                    if (this.bird.PlayerAmmo == 0) {
                        this.ammo.visible = false;
                    }

                    this.updateAmmo();
                }
            }
        });

        // Collider for bird and pipes
        this.physics.world.overlap(this.bird, this.upperPipes, function () {
            this.die();
        }, null, this);
        // Collider for bird and pipes
        this.physics.world.overlap(this.bird, this.lowerPipes, function () {
            this.die();
        }, null, this);

        // Collider for bird pickups
        this.physics.world.overlap(this.bird, this.pickups.pickupGroup, this.pickupObjects, null, this);

        // Collider for pickups and pipes
        this.physics.world.overlap(this.upperPipes, this.pickups.pickupGroup, this.hidePickup, null, this);
        this.physics.world.overlap(this.lowerPipes, this.pickups.pickupGroup, this.hidePickup, null, this);

        // Collider for fireballs and pipes
        this.physics.world.overlap(this.fireballs, this.upperPipes, this.shootPipes, null, this);

        // Collider for fireballs and pipes
        this.physics.world.overlap(this.fireballs, this.lowerPipes, this.shootPipes, null, this);

        // If the player leaves the screen the bird dies
        if (this.bird.y > game.config.height || this.bird.y < 0) {
            this.die();
        }

        // Iterate through the pickups to check if they are out of the screen
        this.pickups.pickupGroup.getChildren().forEach(function (pickup) {
            this.pickups.addPickup(pickup);

            if (pickup.getBounds().right < 0) {

                // If pickup is out of the screen render a new one
                this.pickups.renderPickups(250);
            }
        }, this)
    }

    // Picking up the mistery boxes
    pickupObjects(bird, pickup) {
        // Generate a random pickup type and pass it to the handler
        this.pickupHandler(this.pickups.generatePickupType());

        // Play the sound
        this.pickupSound.play();

        // Make the box disappear
        pickup.disableBody(true, true);

        var that = this;

        // Randomly spawn another pickup
        this.pickups.pickupGroup.children.iterate(function (child) {
            child.enableBody(true, 350 * Phaser.Math.Between(1, 3), Phaser.Math.Between(20, game.config.height - 20), true, true);
            child.setVelocityX(-(that.bird.playerSpeed));
        });
    }

    // If the pickup spawns in pipes hide it
    hidePickup(object, pickup) {
        // Make the box disappear
        pickup.disableBody(true, true);

        var that = this;

        // Randomly spawn another pickup
        this.pickups.pickupGroup.children.iterate(function (child) {
            child.enableBody(true, 350 * Phaser.Math.Between(2, 4), Phaser.Math.Between(20, game.config.height - 20), true, true);
            child.setVelocityX(-(that.bird.playerSpeed));
        });

    }

    shootPipes(ammo, pipe) {
        // Shake the screen
        this.cameras.main.shake(300, 0.01);
        // Play the sound effect        
        this.explosion.play();

        // Handling sprite bodies
        pipe.destroy();
        ammo.disableBody(true, true);
        ammo.enableBody(true, 1500, 1500, true, true);
    }

    // End and restart the game
    die() {

        // If the player has no life points left the game is over
        if (!this.bird.PlayerInvincible) {
            localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));

            // Game over text
            this.gameOver = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "GAME OVER", {
                fontSize: '35px'
            });
            this.gameOver.setOrigin(0.5);

            this.restarting = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, "Restarting in...");
            this.restarting.setOrigin(0.5);

            // Pausing the game
            this.scene.pause();
            this.dieAudio.play();

            // Countdown value
            let counter = 3;

            var counterInterval = setInterval(() => {
                this.restarting.text = counter;
                counter--;
            }, 1000);

            // Restart in 3 seconds
            var that = this;
            setTimeout(function () {
                that.scene.start('PlayGame');
                clearInterval(counterInterval);
            }, 4000);

        }
        // If the player has one lifepoint it will be taken once he's out of the wall
        else {
            // Little cheating here
            // Could not find an "overlap-en" event therefore resetting the skin is on a timer
            var that = this;
            setTimeout(function () {
                that.bird.PlayerInvincible = false;
                that.bird.setTexture('bird');
            }, 800);
        }
    }

    // Calls the respective function based on the randomly generated pickup type
    pickupHandler(pickupType) {

        let typeText = this.add.text(this.bird.x, this.bird.y - 75, pickupType).setInteractive();
        typeText.setOrigin(0.5);

        setTimeout(function () {
            typeText.visible = false;
        }, 1000)

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
            case 'Moving':
                this.movePipes();
                break;
        }
    }

    // Slows the game
    slowGame() {
        this.upperPipes.setVelocityX(-(this.bird.playerSpeed) + 45);
        this.lowerPipes.setVelocityX(-(this.bird.playerSpeed) + 45);
        this.pickups.setSpeed((this.bird.playerSpeed) - 45);

        this.pipeVelocity = (this.bird.playerSpeed) - 45;

        // Resets the speed to normal
        // setTimeout 'this.'' is not the same as Main 'this.'
        // Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.upperPipes.setVelocityX(-(that.bird.playerSpeed));
            that.lowerPipes.setVelocityX(-(that.bird.playerSpeed));
            that.pipeVelocity = (that.bird.playerSpeed);

            that.pickups.setSpeed(that.bird.playerSpeed);
        }, 6000);
    }

    // Fastens the game
    fastenGame() {
        console.log("hello");
        this.upperPipes.setVelocityX(-(this.bird.playerSpeed) - 100);
        this.lowerPipes.setVelocityX(-(this.bird.playerSpeed) - 100);
        this.pickups.setSpeed((this.bird.playerSpeed) + 100);

        this.pipeVelocity = (this.bird.playerSpeed) + 100;

        var that = this;

        // Resets the speed to normal
        // setTimeout 'this.'' is not the same as Main 'this.'
        // Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.upperPipes.setVelocityX(-(that.bird.playerSpeed));
            that.lowerPipes.setVelocityX(-(that.bird.playerSpeed));
            that.pipeVelocity = (that.bird.playerSpeed);

            that.pickups.setSpeed(that.bird.playerSpeed);
        }, 6000);
    }

    ammoHandler() {
        this.bird.PlayerAmmo++;
        this.ammo.visible = true;
        console.log(this.bird.PlayerAmmo);

        this.updateAmmo();
    }

    // Mirror game
    // Not yet functional
    mirrorGame() {
        this.goingLeft = true;

        // Mirror the bird's and flames' sprite
        this.bird.flipX = true;

        this.fireballs.children.iterate(function (child) {
            child.flipX = -1;
        });

        // Resetting everything after the timer
        var that = this;
        setTimeout(function () {
            that.goingLeft = false;

            that.bird.flipX = false;

            this.fireballs.children.iterate(function (child) {
                child.flipX = -1;
            });

        }, 15000);
    }

    // Sets the health value
    healthHandler() {
        if (!this.bird.PlayerInvincible) {
            this.bird.PlayerInvincible = true;
            this.bird.setTexture('invincibleBird');
        }
    }

    // Sets the isMoving to true
    // When pipes spawn they will have an Y velocity
    movePipes() {
        this.isMoving = true;

        // Resets the speed to normal
        // setTimeout 'this.'' is not the same as Main 'this.'
        // Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.isMoving = false;
        }, 15000);
    }
}