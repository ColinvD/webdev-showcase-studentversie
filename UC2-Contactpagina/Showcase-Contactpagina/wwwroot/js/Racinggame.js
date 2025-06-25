//const myCanvas = document.getElementById("gameCanvas");
//const ctx = canvas.getContext("2d");

//const connection = new signalR.HubConnectionBuilder()
//    .withUrl("/gamehub")
//    .build();

//const otherPlayers = {}; // { username: {x, y} }


//const player = {
//    x: 400,
//    y: 300,
//    width: 40,
//    height: 40,
//    speed: 4,
//    color: "#00ff00",
//};

//const keys = {};

//window.addEventListener("keydown", (e) => keys[e.key] = true);
//window.addEventListener("keyup", (e) => keys[e.key] = false);

//connection.start().then(() => {
//    console.log("SignalR connected");
//}).catch(err => console.error(err));

//connection.on("ReceivePlayerPosition", (otherUsername, x, y) => {
//    if (otherUsername !== username) {
//        otherPlayers[otherUsername] = { x, y };
//    }
//});

//function sendPosition() {
//    connection.invoke("UpdatePosition", username, player.x, player.y)
//        .catch(err => console.error(err));
//}

//let frameCount = 0;

//function update() {
//    if (keys["ArrowUp"]) player.y -= player.speed;
//    if (keys["ArrowDown"]) player.y += player.speed;
//    if (keys["ArrowLeft"]) player.x -= player.speed;
//    if (keys["ArrowRight"]) player.x += player.speed;

//    // Niet elke frame zenden om overbelasting te voorkomen
//    if (++frameCount % 5 === 0) {
//        sendPosition();
//    }
//}
//function draw() {
//    ctx.clearRect(0, 0, canvas.width, canvas.height);

//    // Eigen speler
//    ctx.fillStyle = player.color;
//    ctx.fillRect(player.x, player.y, player.width, player.height);
//    ctx.fillStyle = "#fff";
//    ctx.font = "14px Arial";
//    ctx.fillText(username, player.x, player.y - 10);

//    // Andere spelers
//    for (const [name, pos] of Object.entries(otherPlayers)) {
//        ctx.fillStyle = "#ff0000";
//        ctx.fillRect(pos.x, pos.y, player.width, player.height);
//        ctx.fillStyle = "#fff";
//        ctx.fillText(name, pos.x, pos.y - 10);
//    }
//}

//function gameLoop() {
//    update();
//    draw();
//    requestAnimationFrame(gameLoop);
//}

//gameLoop();
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