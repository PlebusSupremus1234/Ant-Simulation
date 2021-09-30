const canvas = <HTMLCanvasElement> document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

import { Global } from "./global.js";
import { Food } from "./food.js";
import { Nest } from "./nest.js";
import { Rectangle } from "./quadtree.js";
import { Pheromone } from "./pheromone.js";
import { Vector } from "./vector.js";

const nest = new Nest(width / 2, height / 2, 50);

for (let i = 0; i < 3; i++) {
    nest.spawnFood(width / 4, height / 4, 50);
    nest.spawnFood(3 * width / 4, height / 4, 50);
    nest.spawnFood(width / 4, 3 * height / 4, 50);
    nest.spawnFood(3 * width / 4, 3 * height / 4, 50);
}

let mousePos = new Vector(0, 0);

function draw() {
    requestAnimationFrame(draw);

    // Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#242424";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pheromones
    let pheromones = [Global.redPheromones, Global.bluePheromones];
    for (let i of pheromones) {
        const pool = i.query(new Rectangle<Pheromone>(width / 2, height / 2, width / 2, height / 2));

        for (let j = pool.length - 1; j >= 0; j--) {
            pool[j].value.life--;
            if (pool[j].value.life === 0) pool[j].flagged = true;
            else pool[j].value.draw(ctx);
        }
    }

    // Food
    const pool = Global.food.query(new Rectangle<Food>(width / 2, height / 2, width / 2, height / 2));
    for (let i of pool) i.value.draw(ctx);

    // Obstacles
    if (Global.isBeingDragged) {
        Global.obstacles[Global.obstacles.length - 1].x2 = mousePos.x;
        Global.obstacles[Global.obstacles.length - 1].y2 = mousePos.y;
    }

    for (let i of Global.obstacles) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ffaf00";
        ctx.beginPath();
        ctx.moveTo(i.x1, i.y1);
        ctx.lineTo(i.x2, i.y2);
        ctx.stroke();
    }

    // Ants
    for (let i of nest.ants) {
        i.steer();
        i.move();
        i.draw(ctx);
    }

    // Nest
    nest.draw(ctx);

    ctx.font = "24px sans-serif";
    ctx.textAlign = "end";
    ctx.fillStyle = "white";
    ctx.fillText("F - Click to add food", canvas.width - 15, canvas.height - 52);
    ctx.fillText("O - Drag to add obstacles", canvas.width - 15, canvas.height - 24);
}

draw();

document.addEventListener("keydown", (event) => {
    if (event.code === "KeyF") Global.tool = 0;
    else if (event.code === "KeyO") Global.tool = 1;
});

canvas.addEventListener("mousemove", (event) => {
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;
});

canvas.addEventListener("mouseup", (event) => {
    Global.isBeingDragged = false;
});

document.addEventListener("mousedown", (event) => {
    if (Global.tool === 0) nest.spawnFood(event.clientX, event.clientY, 50);
    else {
        Global.isBeingDragged = true;
        mousePos = new Vector(event.clientX, event.clientY);
        Global.obstacles.push({
            x1: event.clientX, y1: event.clientY,
            x2: event.clientX, y2: event.clientY,
        });
    }
});