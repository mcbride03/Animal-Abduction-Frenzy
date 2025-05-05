class Player extends Phaser.GameObjects.Sprite {

    // x,y - starting sprite location
    // texture - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, leftKey, rightKey, playerSpeed) {
        super(scene, x, y, texture, frame);

        this.left = leftKey;
        this.right = rightKey;
        this.playerSpeed = playerSpeed;

        scene.add.existing(this);

        this.moveSound = scene.sound.add("sfx_playerMove", { volume: 0.1, loop: true });

        return this;
    }

    update() {

        let isMoving = false;        

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (this.x > (this.displayWidth/2)) {
                this.x -= this.playerSpeed;
                isMoving = true;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (this.x < (game.config.width - (this.displayWidth/2))) {
                this.x += this.playerSpeed;
                isMoving = true;
            }
        }
        // Play movement sound only when moving
        if (isMoving) {
            if (!this.moveSound.isPlaying) {
                this.moveSound.play();
            }
        } else {
            this.moveSound.stop();
        }
    }
}