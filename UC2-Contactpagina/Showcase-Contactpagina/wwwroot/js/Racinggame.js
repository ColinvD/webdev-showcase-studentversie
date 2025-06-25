const connection = new signalR.HubConnectionBuilder()
    .withUrl("/gamehub?username=" + encodeURIComponent(username))
    .build();

const otherPlayers = {}; // { username: {x, y} }

//const player = {
//    x: 400,
//    y: 400,
//};

connection.start().then(() => {
    console.log("SignalR connected");
}).catch(err => console.error(err));

connection.on("ReceivePlayerPosition", (otherUsername, x, y) => {
    if (otherUsername !== username) {
        if (!otherPlayers[otherUsername]) {
            const sprite = game.scene.keys['GameScene'].physics.add.sprite(x, y, 'car').setScale(0.1);
            sprite.setCollideWorldBounds(true);
            otherPlayers[otherUsername] = { sprite };
        }
        otherPlayers[otherUsername].sprite.setPosition(x,y);
    }
});

connection.on("RemovePlayer", (otherUsername) => {
    if (otherPlayers[otherUsername]) {
        otherPlayers[otherUsername].sprite.destroy();
        delete otherPlayers[otherUsername];
    }
});

function sendPosition(playerX, playerY) {
    connection.invoke("UpdatePosition", username, playerX, playerY)
        .catch(err => console.error(err));
}

let frameCount = 0;
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
        this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
        this.load.image('car', '/images/GameAssets/CarSprite.png');
    }

    create() {
        this.add.image(400, 300, 'sky');

        const particles = this.add.particles(0, 0, 'red', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        const logo = this.physics.add.image(400, 100, 'logo');

        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        particles.startFollow(logo);

        this.myPlayer = this.physics.add.sprite(400, 400, 'car').setScale(0.1).refreshBody();
        this.myPlayer.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.myPlayer.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.myPlayer.setVelocityX(160);
        } else {
            this.myPlayer.setVelocityX(0);
        }

        if (this.cursors.down.isDown) {
            this.myPlayer.setVelocityY(160);
        } else if (this.cursors.up.isDown) {
            this.myPlayer.setVelocityY(-160);
        } else {
            this.myPlayer.setVelocityY(0);
        }

        if (++frameCount % 5 === 0) {
            sendPosition(this.myPlayer.x, this.myPlayer.y);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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