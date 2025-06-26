const container = document.getElementById('phaser-container');
const username = container.dataset.username;
const role = container.dataset.role;

// Controleer toegang
const canBoost = role === "Betaald";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/gamehub?username=" + encodeURIComponent(username))
    .build();

const otherPlayers = {};
const carSizes = 0.05;

connection.start().then(() => {
    console.log("SignalR connected");
}).catch(err => console.error(err));

connection.on("ReceivePlayer", (otherUsername, x, y, angle) => {
    if (otherUsername !== username) {
        if (!otherPlayers[otherUsername]) {
            const sprite = game.scene.keys['GameScene'].physics.add.sprite(x, y, 'car').setScale(carSizes);
            sprite.tint = getVisibleRandomHexColor();
            sprite.setCollideWorldBounds(true);
            otherPlayers[otherUsername] = { sprite };
        }

        const playerSprite = otherPlayers[otherUsername].sprite;
        playerSprite.setPosition(x, y);
        playerSprite.setAngle(angle);
    }
});

connection.on("RemovePlayer", (otherUsername) => {
    if (otherPlayers[otherUsername]) {
        otherPlayers[otherUsername].sprite.destroy();
        delete otherPlayers[otherUsername];
    }
});

function sendPlayer(playerX, playerY, playerAngle) {
    connection.invoke("UpdatePlayer", username, playerX, playerY, playerAngle)
        .catch(err => console.error(err));
}
function getVisibleRandomHexColor() {
    let r, g, b;
    do {
        r = Math.floor(Math.random() * 256);
        g = Math.floor(Math.random() * 256);
        b = Math.floor(Math.random() * 256);
    } while (r < 20 && g < 20 && b < 20); // voorkom zwart of bijna zwart

    const colorInt = (r << 16) | (g << 8) | b;
    return `0x${colorInt.toString(16).padStart(6, '0')}`;
}

let frameCount = 0;
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('white', '/images/GameAssets/WhiteParticle.png');
        this.load.image('car', '/images/GameAssets/CarSprite.png');
        this.load.image('track', '/images/GameAssets/Track.png');
    }

    create() {
        this.add.image(0, 0, 'track').setOrigin(0, 0);

        this.tireSmoke = this.add.particles(0, 0, 'white', {
            lifespan: 300,
            speed: 10,
            scale: { start: 0.3, end: 0 },
            blendMode: 'NORMAL',
            quantity: 1,
            emitting: false,
        });
        this.tireSmoke.particleTint = '0x808080';

        this.boostSmoke = this.add.particles(0, 0, 'white', {
            lifespan: 300,
            speed: 10,
            scale: { start: 0.3, end: 0 },
            blendMode: 'NORMAL',
            quantity: 1,
            emitting: false,
        });
        this.boostSmoke.particleTint = '0xff0000';

        this.myPlayer = this.physics.add.sprite(400, 400, 'car').setScale(carSizes).refreshBody();
        this.myPlayer.tint = getVisibleRandomHexColor();
        this.myPlayer.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.tireSmoke.startFollow(this.myPlayer);
        this.boostSmoke.startFollow(this.myPlayer);

        this.speed = 0;
        this.maxSpeed = 500;
        this.acceleration = 3;
        this.friction = 3;

        // Boost & handrem status
        this.isBoosting = false;
        this.isHandbraking = false;
        this.baseMaxSpeed = this.maxSpeed;
        this.boostedMaxSpeed = 800;     // max snelheid tijdens boost
        this.boostDuration = 1000;      // 1 seconde boost
        this.boostCooldown = 2000;      // 2 seconden wachten
        this.lastBoostTime = 0;
    }

    update() {
        // Richtingstoetsen uitlezen
        const isUp = this.cursors.up.isDown || this.wasd.up.isDown;
        const isDown = this.cursors.down.isDown || this.wasd.down.isDown;
        const isLeft = this.cursors.left.isDown || this.wasd.left.isDown;
        const isRight = this.cursors.right.isDown || this.wasd.right.isDown;
        const now = this.time.now;

        // Handrem logica
        this.isHandbraking = this.cursors.space.isDown;

        // Boost logica

        if (typeof canBoost !== 'undefined' && canBoost) {
            // Activeer boost
            const wantsBoost = this.cursors.shift.isDown;
            if (wantsBoost && !this.isBoosting && now - this.lastBoostTime > this.boostCooldown) {
                this.isBoosting = true;
                this.maxSpeed = this.boostedMaxSpeed;
                this.lastBoostTime = now;
                this.time.delayedCall(this.boostDuration, () => {
                    this.isBoosting = false;
                    this.maxSpeed = this.baseMaxSpeed;
                    this.boostSmoke.emitting = this.isBoosting;
                });

                this.boostSmoke.emitting = this.isBoosting;
            }
        }

        // Versnellen en vertragen
        if (isUp) {
            const accel = this.isBoosting ? this.acceleration * 1.5 : this.acceleration;
            this.speed = Math.min(this.speed + accel, this.maxSpeed);
        } else if (isDown) {
            this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed / 2);
        } else {
            // Geen input: wrijving toepassen
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - this.friction, 0);
            } else {
                this.speed = Math.min(this.speed + this.friction, 0);
            }
        }

        // Stap 2: Handrem OVERSCHRIJFT andere snelheid
        if (this.isHandbraking) {
            const brakeStrength = this.friction * 4;
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - brakeStrength, 0);
            } else {
                this.speed = Math.min(this.speed + brakeStrength, 0);
            }
        }

        // Slipdetectie moet NA snelheid en input komen
        const isTurning = isLeft || isRight;
        const isSlipping = this.isHandbraking || (Math.abs(this.speed) > 250 && isTurning);
        const baseTurnRate = this.isHandbraking ? 8 : isSlipping ? 3 : 2;
        const speedFactor = Phaser.Math.Clamp(Math.abs(this.speed) / this.maxSpeed, 0.3, 1);
        const turnRate = baseTurnRate * speedFactor;
        // Roterende besturing (auto draait als hij snelheid heeft)
        if (Math.abs(this.speed) > 50 || this.isHandbraking) {
            const direction = this.speed < 0 ? -1 : 1;

            if (isLeft) {
                this.myPlayer.angle -= turnRate * direction;
            } else if (isRight) {
                this.myPlayer.angle += turnRate * direction;
            }
        }

        // Reken nieuwe richting uit
        const rad = Phaser.Math.DegToRad(this.myPlayer.angle - 90);
        const vec = new Phaser.Math.Vector2();
        vec.setToPolar(rad, this.speed);

        this.myPlayer.setVelocity(vec.x, vec.y);

        // Laat rook zien bij slippen
        this.tireSmoke.emitting = isSlipping;

        // Verzend locatie voor multiplayer
        if (++frameCount % 5 === 0) {
            sendPlayer(this.myPlayer.x, this.myPlayer.y, this.myPlayer.angle);
        }
    }

}

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    parent: 'phaser-container',
    scene: GameScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
};

const game = new Phaser.Game(config);