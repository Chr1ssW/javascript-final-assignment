class Player extends Phaser.Physics.Arcade.Sprite
{
    //gravity that makes the bird fall
    #_playerGravity = 800;

    //determines how fast the bird moves horizontally
    #_playerSpeed = 150;

    //determines how high the bird flies with each click
    #_playerFlapPower = 300;

    //players health
    #_playerInvincible = false;

    //player ammo
    #_playerAmmo = 10;

    //Creates a new player object and places it on the screen
    //game - the scene where the object should appear
    //x, y - coordinates of the object within the scene
    //skin - loads the asset that the object will have on the sceene
    constructor(game, x, y, skin)
    {
        super(game, x, y, skin);
        game.add.existing(this);
        game.physics.add.existing(this);
        
        this.body.gravity.y = this.#_playerGravity;
    }

    set PlayerInvincible(value)
    {        
        this.#_playerInvincible = value;        
    }

    get PlayerInvincible()
    {
        return this.#_playerInvincible;
    }

    set PlayerAmmo(value)
    {        
        this.#_playerAmmo = value;        
    }

    get PlayerAmmo()
    {
        return this.#_playerAmmo;
    }

    set playerGravity(value)
    {
        this.#_playerGravity = value;
    }
    
    get playerGravity()
    {
        return this.#_playerGravity;
    }

    set playerSpeed(value)
    {
        this.#_playerSpeed = value;
    }
    
    get playerSpeed()
    {
        return this.#_playerSpeed;
    }

    set playerFlapPower(value)
    {
        this.#_playerFlapPower = value;
    }
    
    get playerFlapPower()
    {
        return this.#_playerFlapPower;
    }

    set playerGravityY(y)
    {
        this.body.gravity.y = y;
    }

    //Flaps the bird's wings
    ascend()
    {
        this.body.velocity.y = (-(this.#_playerFlapPower));
    }
}