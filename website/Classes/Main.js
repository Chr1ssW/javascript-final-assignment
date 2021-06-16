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
        this.load.image('upperPipe', 'resources/topPipe.png');
        this.load.image('bottomPipe', 'resources/bottomPipe.png');
        this.load.image('pickup', 'resources/pickup.png');
        this.load.image('background', 'resources/background.png');
        this.load.image('ammo', 'resources/ammo.png');
        this.load.image('noAmmo', 'resources/noAmmo.png');
        this.load.image('fireball', 'resources/fireball.png');       
    }

    //Initializes the assets in the game
    //And places them on the canvas
    create() {

        this.thisField;
      
        //Adding pipes
        this.upperPipes = this.physics.add.group();
        this.lowerPipes = this.physics.add.group();

        //Setting the background
        this.add.image(160, 240, 'background');

        //Mouse keys
        this.cursors = this.input.keyboard.createCursorKeys();

        //Keyboard keys
        this.inputKeys = [];
        this.inputKeys.push(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))

        //Creating the bird
        this.bird = new Player(this, 80, game.config.height / 2, 'bird');

        //Being updated needs to be preserved
        this.pipeVelocity = this.bird.playerSpeed;

        //Creating pickups
        this.pickups = new Pickups(this);
        this.pickups.setSpeed(this.bird.playerSpeed);

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

        //Spawn pipes
        this.spawnPipes();
    }

    //Timer that spawns the pipes
    spawnPipes(){
        this.thisField = this.time.addEvent({
            delay: 1500,
            callback: this.generatePipes,
            callbackScope: this,
            loop: true
        });
    }

    //Generates the pipes
    generatePipes(){
            //Randomly picking the size of the gap
            let gap = Phaser.Math.Between(90, 120);

            //Selecting a random number between 1 and 6
            //If it is 1 then the gap will be 0 and the player has to shoot
            //Only spawns if user has ammo
            let fate = Phaser.Math.Between(1, 6);
            if (fate == 1 && this.bird.PlayerAmmo > 0){
                gap = 0;
            }

            //Minimum distance has to be at least 320
            let distance = 320 + gap;

            //Picking the hole position
            //This is the middle of the gap
            let pipeHolePosition = Phaser.Math.Between(130, 330);


            let lowerY = pipeHolePosition + distance / 2;
            let upperY = pipeHolePosition - distance / 2;

            this.placePipe('upperPipe', upperY);
            this.placePipe('bottomPipe', lowerY);
    }

    //Places the pipes on the screen
    placePipe(skin, y){     
        if (skin === 'upperPipe'){
            this.upperPipes.create(500, y, skin);
            this.upperPipes.setVelocityX(- (this.pipeVelocity));
        }else{
            this.lowerPipes.create(500, y, skin);
            this.lowerPipes.setVelocityX(-(this.pipeVelocity)); 
            console.log(this.pipeVelocity);
        }
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
        this.physics.world.overlap(this.bird, this.upperPipes, function () {
            this.die();
        }, null, this);
        //Collider for bird and pipes
        this.physics.world.overlap(this.bird, this.lowerPipes, function () {
            this.die();
        }, null, this);

        //Collider for bird pickups
        this.physics.world.overlap(this.bird, this.pickups.pickupGroup, this.pickupObjects, null, this);

        //Collider for fireballs and pipes
        this.physics.world.overlap(this.fireballs, this.upperPipes, this.shootPipes, null, this);
        
        //Collider for fireballs and pipes
        this.physics.world.overlap(this.fireballs, this.lowerPipes, this.shootPipes, null, this);

        //If the player leaves the screen the bird dies
        if (this.bird.y > game.config.height || this.bird.y < 0) {
            this.die();
        }
        
        //Iterate through the pickups to check if they are out of the screen
        this.pickups.pickupGroup.getChildren().forEach(function (pickup) {
            this.pickups.addPickup(pickup);

            if (pickup.getBounds().right < 0) {

                //If pickup is out of the screen render a new one
                this.pickups.renderPickups(250);
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
        console.log('hitPipe');
        pipe.destroy();   
        ammo.disableBody(true, true);    
        ammo.enableBody(true, 1500,1500, true, true);
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
        this.upperPipes.setVelocityX(- (this.bird.playerSpeed) + 45);
        this.lowerPipes.setVelocityX(- (this.bird.playerSpeed) + 45);
        this.pickups.setSpeed((this.bird.playerSpeed) - 45);

        this.pipeVelocity = (this.bird.playerSpeed) - 45;
        
        //Resets the speed to normal
        //setTimeout 'this.'' is not the same as Main 'this.'
        //Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.upperPipes.setVelocityX(- (that.bird.playerSpeed));
            that.lowerPipes.setVelocityX(- (that.bird.playerSpeed));
            that.pipeVelocity = (that.bird.playerSpeed);

            that.pickups.setSpeed(that.bird.playerSpeed);
        }, 6000);
    }

    //Fastens the game
    fastenGame() {
        console.log("hello");
        this.upperPipes.setVelocityX(- (this.bird.playerSpeed) - 100);
        this.lowerPipes.setVelocityX(- (this.bird.playerSpeed) - 100);
        this.pickups.setSpeed((this.bird.playerSpeed) + 100);

        this.pipeVelocity = (this.bird.playerSpeed) + 100;

        var that = this;

        //Resets the speed to normal
        //setTimeout 'this.'' is not the same as Main 'this.'
        //Therefore have to save it in a variable and use that
        var that = this;
        setTimeout(function () {
            that.upperPipes.setVelocityX(- (that.bird.playerSpeed));
            that.lowerPipes.setVelocityX(- (that.bird.playerSpeed));
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

    //Mirror game
    //Not yet functional
    mirrorGame() {
        //this.pipes.setSpeed(-(this.bird.playerSpeed));

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