class Pipes 
{
    #_pipeGroup;
    #_pipePool = [];

    //minimum pipe height
    //affects hole position
    #_minPipeHeight = 50;

    //distance between each pipe pair
    #_pipeDistance = [220, 280];

    //hole size between piped
    #_pipeHole = [100, 130];

    #_pipeXPosition;

    constructor(scene)
    {
        this.#_pipeGroup = scene.physics.add.group();

        for(let i = 0; i < 4; i++)
        {
            this.#_pipePool.push(this.#_pipeGroup.create(0, 0, 'pipe'));
            this.#_pipePool.push(this.#_pipeGroup.create(0, 0, 'pipe'));

            this.placePipes();
        }
    }

    get pipePool()
    {
        return this.#_pipePool;
    }

    get pipeGroup()
    {
        return this.#_pipeGroup;
    }

    get pipeXPosition()
    {
        return this.#_pipeXPosition;
    }

    placePipes()
    {
        let rightmost = this.getRightmostPipe();
        let pipeHoleHeight = Phaser.Math.Between(this.#_pipeHole[0], this.#_pipeHole[1]);
        let pipeHolePosition = Phaser.Math.Between(this.#_minPipeHeight + pipeHoleHeight / 2, game.config.height -  this.#_minPipeHeight - pipeHoleHeight / 2);
        this.#_pipePool[0].x = rightmost + this.#_pipePool[0].width + Phaser.Math.Between(this.#_pipeDistance[0], this.#_pipeDistance[1]);
        this.#_pipeXPosition = this.#_pipePool[0].x - rightmost;
        this.#_pipePool[0].y = pipeHolePosition - pipeHoleHeight / 2;
        this.#_pipePool[0].setOrigin(0, 1);
        this.#_pipePool[1].x = this.#_pipePool[0].x;
        this.#_pipePool[1].y = pipeHolePosition + pipeHoleHeight / 2;
        this.#_pipePool[1].setOrigin(0, 0);
        this.#_pipePool = [];

        
    }

    getRightmostPipe()
    {
        let rightmostPipe = 0;
        this.#_pipeGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });

        return rightmostPipe;
    }

    setSpeed(speed)
    {
        this.#_pipeGroup.setVelocityX(- (speed));
    }

    
    addPipe(pipe)
    {
        this.#_pipePool.push(pipe);
    }
}