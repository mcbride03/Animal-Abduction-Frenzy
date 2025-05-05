// Michael McBride
// Created: 5/5/2025
// Phaser: 3.70.0
//
// Gallery Shooter
//
// A gallery shooter game inspired by the abduction of animals
// 
// 
// Art assets from Kenny Assets "" set:
// link

"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 600,
    scene: [Level],
    fps: { forceSetTimeOut: true, target: 60 }
}

const game = new Phaser.Game(config);