class Pickups
{
    #_pickupGroup;
    #_pickupStore = [];

    constructor(scene)
    {
        this.#_pickupGroup = scene.physics.add.group();
        this.#_pickupStore.push(this.#_pickupGroup.create(450, Phaser.Math.Between(20, game.config.height - 20), 'pickup'));
    }

    get pickupGroup()
    {
        return this.#_pickupGroup;
    }

    addPickup(pickup)
    {
        this.#_pickupStore.push(pickup);
    }

    setSpeed(speed)
    {
        this.#_pickupGroup.setVelocityX(-(speed));
    }

    renderPickups(pos)
    {
        let doIt = Phaser.Math.Between(0, 10);
        if (doIt == 1) {
            this.#_pickupStore[0].x = 350 * Phaser.Math.Between(1, 3);
            this.#_pickupStore[0].y = Phaser.Math.Between(20, game.config.height - 20);
            this.#_pickupStore[0].setOrigin(0, 1);
            this.#_pickupStore = [];
        }
    }

    getLastPickup() {
        let lastPickup = 0;
        this.#_pickupGroup.getChildren().forEach(function (pickup) {
            lastPickup = Math.max(lastPickup, pickup.x);
        });

        return lastPickup;
    }

    generatePickupType()
    {
        let pickupTypes = [
            "Slow",
            "Fast",
            "Ammo",
            "Health"];

        let random = Phaser.Math.Between(0, pickupTypes.length - 1);

        return pickupTypes[random];
    }

}