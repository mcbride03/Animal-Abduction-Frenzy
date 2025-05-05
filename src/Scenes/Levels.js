class Level extends Phaser.Scene{
    constructor() {
        super("Level");

        this.my = {sprite: { }};  // Create an object to hold sprite bindings

        // player starting position and speed
        this.bodyX = 400;
        this.bodyY = 150;
        this.bodySpeed = 5;

        // projectile speed and active flag
        this.projectileSpeed = 12; 
        this.projectileActive = false; // Track if the projectile is in flight
        
        // UI txt
        this.scoreText;
        this.waveText;
    }
    preload() {
    // assets
    
    // load ui elements
        this.load.setPath("./assets/pixel_fonts/fonts")
        this.load.bitmapFont('font', 'round_6x6.png', 'round_6x6.xml');

        this.load.setPath("./assets/kenney_pico-8-platformer/Transparent/Tiles");
        this.load.image("heart", "tile_0132.png");
        this.load.image("halfHeart", "tile_0133.png");
        this.load.image("emptyHeart", "tile_0134.png");

    // load backgrounds
        // sky
        this.load.setPath("./assets/kenney_space-shooter-redux/Backgrounds");
        this.load.image("bgSky","purple.png");
        // grass
        this.load.setPath("./assets/kenney_shooting-gallery/PNG/Stall");
        this.load.image("bgGrass", "bg_green.png");
        this.load.image("bgGrassTop", "grass2.png");
        // fence
        this.load.setPath("./assets/kenney_shooting-gallery/PNG/Objects");
        this.load.image("fencePiece", "stick_wood_outline_broken.png");
    
    // load sprites
        // load animals
        this.load.setPath("./assets/kenney_animal-pack-redux/PNG/Round (outline)");
        this.load.image("cow","cow.png");
        this.load.image("pig","pig.png");
        this.load.image("chicken","chicken.png");
        
        // load player
        this.load.setPath("./assets/kenney_alien-ufo-pack/PNG");
        this.load.image("playerShip","shipPink_manned.png");

        // load laser animation sprites
        this.load.image("laserBurst01", "laserBlue_groundBurst.png");
        this.load.image("laserBurst02", "laserBlue_burst.png");
        this.load.image("laserBurst03", "laserBlue3.png")
        
        // load player & animal lasers
        this.load.setPath("./assets/kenney_space-shooter-redux/PNG/Lasers");
        this.load.image("laser", "laserBlue01.png");
        this.load.image("redLaser", "laserRed05.png");

        // load audio assets
        this.load.setPath("./assets/kenney_sci-fi-sounds/Audio");
        this.load.audio("sfx_playerShoot", "laserLarge_002.ogg");
        this.load.audio("sfx_animalShoot", "laserSmall_001.ogg");
        this.load.audio("sfx_playerMove", "spaceEngine_002.ogg");
        this.load.audio("sfx_playerHit", "explosionCrunch_000.ogg");
        this.load.audio("sfx_animalHit", "laserRetro_004.ogg");
        this.load.audio("sfx_newWave", "forceField_002.ogg"); // play twice

    }
    create() {
        let my = this.my;

        // ========== CREATE BACKGROUND =======================================
            // sky
            for (let i = 0; i < 800; i += 256) {
                for (let j = 0; j < 256; j += 128) {
                    my.sprite.bgSky = this.add.sprite(i,j, "bgSky");
                }
            }
            // top of grass
            for (let i = 0; i < 800; i += 128) {
                my.sprite.bgGrassTop = this.add.sprite(i, 300, "bgGrassTop");
            }
            // grass
            for (let i = 0; i < 800; i += 128) {
                for (let k = 400; k < 600; k += 128) {
                    my.sprite.bgGrass = this.add.sprite(i,k, "bgGrass");
                }
            }
            // fence
            for (let i = 8; i < 800; i += 16) {
                my.sprite.fencePiece = this.add.sprite(i, 280, "fencePiece");
            }
        // ====================================================================

        // constants, counters, and flags
        this.health = 3.0;
        this.score = 0; 

        // wave logic
        this.wave = 0;
        this.waveActive = false;
        
        //invincible for 1 second after taking dmg
        this.invincible = false;
        this.invincibilityDuration = 1000; // 1 second

        // save highScore to local storage
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;

        // UI creation
        this.scoreText = this.add.bitmapText(10, 10, 'font', 'Score: ' + this.score, 50);
        this.waveText = this.add.bitmapText(600, 10, 'font', 'WAVE ' + this.wave, 50);
        this.highscoreText = this.add.bitmapText( 10, 45, 'font', 'Highscore: ' + this.highScore, 20);
        this.hearts = [
            this.add.sprite(35, 90, "heart").setScale(6),
            this.add.sprite(90, 90, "heart").setScale(6),
            this.add.sprite(145, 90, "heart").setScale(6)
        ];

        // Load key press
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Group to hold animal sprites and missiles
        this.animalGroup = this.add.group();  

        this.enemyMissileGroup = this.add.group();

        // player & projectile sprite creation
        my.sprite.body = new Player(this, this.bodyX, this.bodyY, "playerShip", null, this.aKey, this.dKey, this.bodySpeed);
        my.sprite.body.setScale(0.75);

        my.sprite.projectile = this.add.sprite(-100, -100, "laser");
        my.sprite.projectile.setScale(0.75);
        my.sprite.projectile.visible = false;

        // animation creation
        this.anims.create({
            key: "laser boom",
            frames: [
                // { key: "laserBurst03" },
                { key: "laserBurst03" },
                { key: "laserBurst01" },
                { key: "laserBurst02" },
            ],
            frameRate: 12,
            repeat: 0,
            hideOnComplete: true
        });
        
        this.startNextWave();

    }
    update(time, delta){
        let my = this.my;

        my.sprite.body.update();
        
        // end game state
        if (this.health <= 0) {
            this.gameOver();
            return; // skip rest of update
        }      

        // Player shoot
        if (this.spaceKey.isDown &&  !this.projectileActive) {
            // Position the projectile at the player
            my.sprite.projectile.x = my.sprite.body.x;
            my.sprite.projectile.y = my.sprite.body.y + my.sprite.projectile.displayHeight/.75;
            my.sprite.projectile.visible = true;
            this.projectileActive = true;
            this.sound.play('sfx_playerShoot', {
                volume: 0.5 
             });
        }

        // Move the projectile if it's active
        if (this.projectileActive) {
            my.sprite.projectile.y += this.projectileSpeed;

            // Deactivate if it leaves the screen or collides with sprite
            if (my.sprite.projectile.y > 600) {
                this.projectileActive = false;
                my.sprite.projectile.visible = false;
            } else {
                // check collisions for each sprite while projectile is active
                for (let animal of this.animalGroup.getChildren()) {
                    if (this.checkCollision(my.sprite.projectile, animal)) {
                        this.handleHit(my.sprite.projectile, animal);
                        this.scoreText.setText("Score: " + this.score);
                        this.projectileActive = false;
                        break;
                    }
                }
            }
        }

        // shoot enemy missiles
        this.enemyMissileGroup.getChildren().forEach(missile => {

            missile.y += missile.speed * delta/1000;

            // enemy missile hits player
            if (!this.invincible && this.checkCollision(missile, this.my.sprite.body)) {
                missile.destroy();
                this.health -= missile.dmg;
                this.flashSprite(this.my.sprite.body);
                this.updateHearts();
                this.sound.play('sfx_playerHit', {
                    volume: 0.5 
                 });

                // player invincibility for 1 second after getting hit
                this.invincible = true;
                this.time.delayedCall(this.invincibilityDuration, () => {
                    this.invincible = false;
                }, null, this);
            }
            
            // missile off screen
            if (missile.y < 0 || missile.y > 600) {
                missile.destroy();
            }
        });
        
    }

    startNextWave() {
        this.waveText.setText("WAVE " + this.wave);
        this.flashSprite(this.waveText);
        this.sound.play('sfx_newWave', {
            volume: 0.5,
            repeat: 3
        });
        this.waveActive = true;
        this.wave++;
    
        let numEnemies = Phaser.Math.Clamp(3 + this.wave, 3, 100);  // scale up enemies over time
    
        for (let i = 0; i < numEnemies; i++) {
            this.time.delayedCall(i * 300, () => {
                this.spawnAnimals();
            });
        }
    }

    spawnAnimals() {

        // maximum animals on-screen
        if (this.animalGroup.getLength() >= 10) {
            return;
        }
        
        // cows spawn on either right or left side of screen @ random Y level    
        let side = Phaser.Math.Between(0,1);
        let spawnX = side == 1 ? 825 : -25;
        side = side == 1 ? "left" : "right";

        // select random animal to spawn
        let randAnimal = Phaser.Math.Between(0,2);

        // spawn animals randomly
        let animal;
        if (randAnimal == 0) {
            animal = new Animal(this, spawnX, Phaser.Math.Between(350, 450), "cow", side, 10000, 0.5, 10, 2);
        } else if (randAnimal == 1) {
            animal = new Animal(this, spawnX, Phaser.Math.Between(400, 450), "pig", side, 9000, 0.35, 25, 1);
        } else {
            animal = new Animal(this, spawnX, Phaser.Math.Between(500, 550), "chicken", side, 8000, 0.25, 50, 1);
        }

        this.animalGroup.add(animal);

        // Set the shoot timer for animal
        // cows: 2-3.5 sec
        // pigs: 1-2 sec
        // chickens 0.5 -1 sec
        animal.shootTimer = this.time.addEvent({
            delay: Phaser.Math.Between(500, 5000),
            callback: () => {
                if (this.animalGroup.contains(animal)) {
                    this.enemyShoot(animal);
                }
            },
            loop: true
        });


    }

    updateHearts() {
        let fullHearts = Math.floor(this.health);
        let halfHeart = (this.health % 1) >= 0.5;
    
        for (let i = 0; i < this.hearts.length; i++) {
            if (i < fullHearts) {
                this.hearts[i].setTexture("heart");
            } else if (i === fullHearts && halfHeart) {
                this.hearts[i].setTexture("halfHeart");
            } else {
                this.hearts[i].setTexture("emptyHeart");
            }

            this.flashSprite(this.hearts[i]);
        }
    
    }

    // (animation)
    flashSprite(sprite) {
        this.tweens.add({
            targets: sprite,
            alpha: { from: 1, to: 0 },
            duration: 100,
            yoyo: true,
            repeat: 2
        });
    }

    enemyShoot(animal) {
        let missile = this.enemyMissileGroup.create(animal.x, animal.y, "redLaser");

        this.sound.play('sfx_animalShoot', {
            volume: 0.5 
         });
        // give missile properties based on which animal shot it
        if (animal.type === "cow")
        {
            missile.setScale(0.75);
            missile.speed = -250;
            missile.dmg = 1.5;
        } else if (animal.type === "pig") {
            missile.setScale(0.75);
            missile.speed = -350;
            missile.dmg = 1.0;
        } else {
            missile.setScale(0.75);
            missile.speed = -425;
            missile.dmg = 0.5;
        }
    }

    handleHit(projectile, animal) {
        // play laser animation
        this.burst = this.add.sprite(projectile.x, projectile.y, "laserBurst03").setScale(0.5).play("laser boom");
        animal.health--;
        this.flashSprite(animal);
        projectile.visible = false;
        this.projectileActive = false;
        this.sound.play('sfx_animalHit', {
            volume: 0.5 
         });

        if (animal.health > 0) return;
        // reset projectile && decrement # of active animals
        animal.destroy();
        this.score += animal.points;
        console.log(this.score);
        this.animalGroup.remove(animal, true, true);


        if (this.animalGroup.getLength() === 0) {
            this.time.delayedCall(1000, this.startNextWave, null, this);
        }
    }

    checkCollision(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    gameOver(){
        // Stop all animal actions
        this.animalGroup.getChildren().forEach(animal => {
            if (animal.shootTimer) animal.shootTimer.remove(false);
            animal.destroy();
        });
        this.enemyMissileGroup.clear(true, true);

        // Show game over text
        const gameOverText = this.add.bitmapText(400, 250, 'font', 'GAME OVER', 50)
            .setOrigin(0.5);
        const restartText = this.add.bitmapText(400, 320, 'font', 'Press R to Restart', 30)
            .setOrigin(0.5);

        // Stop player movement
        this.my.sprite.body.setActive(false).setVisible(false);
        this.projectileActive = false;
        this.my.sprite.projectile.visible = false;

        // update highscore
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        } 

        this.invincibile = false;

        // Wait for R key to restart
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart("Level");
        });
    }
}

