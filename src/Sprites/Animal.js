class Animal extends Phaser.GameObjects.Sprite {

    // x,y - starting sprite location
    // texture - key for the sprite image asset
    // direction - direction sprite should move
    // scale - scaling image
    constructor(scene, x, y, texture, direction, speed, scale, points, health) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.health = health;
        this.sprite = scene.add.existing(this);
        this.type = texture;
        this.sprite.setScale(scale);
        this.direction = direction;
        this.points = points;
        const distance = 900;

        const tweenProps = {
            targets: this,
            x: { start: 0, from: 400, to: 600 },
            duration: speed,
            yoyo: true,
            repeat: -1,
        };

        if (direction === "right") {
            tweenProps.x = `+=${distance}`;
        } else {
            tweenProps.x = `-=${distance}`;
        }

        scene.tweens.add(tweenProps);
    }

    update() {
        // per-frame logic here (e.g., animations)
    }

    destroy() {
        super.destroy();
    }

}