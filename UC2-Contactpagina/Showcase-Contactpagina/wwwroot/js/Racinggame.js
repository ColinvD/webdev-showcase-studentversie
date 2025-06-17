const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/gamehub")
    .build();

const otherPlayers = {}; // { username: {x, y} }


const player = {
    x: 400,
    y: 300,
    width: 40,
    height: 40,
    speed: 4,
    color: "#00ff00",
};

const keys = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

connection.start().then(() => {
    console.log("SignalR connected");
}).catch(err => console.error(err));

connection.on("ReceivePlayerPosition", (otherUsername, x, y) => {
    if (otherUsername !== username) {
        otherPlayers[otherUsername] = { x, y };
    }
});

function sendPosition() {
    connection.invoke("UpdatePosition", username, player.x, player.y)
        .catch(err => console.error(err));
}

let frameCount = 0;

function update() {
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // Niet elke frame zenden om overbelasting te voorkomen
    if (++frameCount % 5 === 0) {
        sendPosition();
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Eigen speler
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.fillText(username, player.x, player.y - 10);

    // Andere spelers
    for (const [name, pos] of Object.entries(otherPlayers)) {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(pos.x, pos.y, player.width, player.height);
        ctx.fillStyle = "#fff";
        ctx.fillText(name, pos.x, pos.y - 10);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();