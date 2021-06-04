class Pickups
{
    #_pickupGroup;
    #_pickupStore = [];

    constructor(scene)
    {
        this.#_pickupGroup = scene.physics.add.group();
        this.#_pickupStore.push(this.#_pickupGroup.create(0, 0, 'bird'));
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
            this.#_pickupStore[0].x = this.getLastPickup() + pos;
            this.#_pickupStore[0].y = Phaser.Math.Between(10, game.config.height - 10);
            this.#_pickupStore[0].setOrigin(0, 1);
            this.#_pickupStore = [];
            console.log("rendered");
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
            "Health",
            "Mirror",
            "Fast",
            "Slow",
            "Moving",
            "Ammo"];

        let random = Phaser.Math.Between(0, pickupTypes.length);

        return pickupTypes[random];
    }

}