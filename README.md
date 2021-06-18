# JavaScript Start Document - Flappy Bird Extreme

## Version management

|     Changes     |   Date   |
|-----------------| -------- |
| Initial commit, `Hello-world` app                | 26/05/21 |
| Added structure to document, added description   | 03/06/21 |
| Added class diagram                              | 04/06/21 |
| Updated class diagram                            | 16/06/21 |

## Description

This game is the final assignment for the course JavaScript in period 2.4.

---

### __Introduction__

The game is built on top of the classic and well-known Flappy Bird game. If you are already familiar with the game you can continue to the 'Extras' section. Flappy Bird is an arcade-style game where the user controls a bird, that moves to the right at all times. The player must navigate the bird through pairs of pipes that have equally sized gaps placed at random heights. Because of gravity, the bird constantly falls and only ascends when the player taps the touchscreen. Each successful pass through a pair of pipes awards the player one point. Colliding with a pipe or the game's borders will end the game. In the game over screen the player will recieve medals based on their result.<sup>1</sup>

### __Extras__

This version contains some extras that make the gameplay more interesting than just an endless runner. The user can pick up mistery boxes that either help him or hold him back.

The mistery boxes can include the following:

- __Slow time__ makes the obstacles appear slower therefore the player has more time to navigate through them (_6 seconds_)
- __Accelerate time__ makes the obstacles appear faster therefore the player has less time to navigate thus increases the chance of losing (_10 seconds_)
- __Ammo__ can be used to shoot the obstacles. All obstacles can be shot but it is smart for the user to reserve his ammo because walls __without a gap__ can also spawn
- __Moving obstacles__ will make the obstacles move up and down therefore it is more difficult to navigate through the gap (_15 seconds_)
- __Invincibility__ lets the user walk through walls once
- __Mirror__ will change the course of the gameplay and make the user go left (_10 seconds_)

## Class diagram

![Class diagram](c-drm.png?raw=true "Class diagram")

## Set up

To set up the game the user needs a local server. This is preferably `Xampp`, but it should work with any other localhost. The user must place the files on the local server and open the `index.html` through the browser.

The game is best played with headphones.

## Controls

The game has only two controls:

1. `left-click` on the mouse will make the bird ascend
2. `space` will shoot if the user has ammo

## References

1. Wikipedia. (2021, May 19). Flappy Bird. Wikipedia. [https://en.wikipedia.org/wiki/Flappy_Bird](https://en.wikipedia.org/wiki/Flappy_Bird).
