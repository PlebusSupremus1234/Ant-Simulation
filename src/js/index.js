const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
import { Global } from "./global.js";
import { Nest } from "./nest.js";
import { Rectangle } from "./quadtree.js";
const nest = new Nest(width / 2, height / 2, 100);
for (let i = 0; i < 5; i++) {
    nest.spawnFood(width / 4, height / 4, 50);
    nest.spawnFood(3 * width / 4, height / 4, 50);
    nest.spawnFood(width / 4, 3 * height / 4, 50);
    nest.spawnFood(3 * width / 4, 3 * height / 4, 50);
}
function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#242424";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let pheromones = [Global.redPheromones, Global.bluePheromones];
    for (let i of pheromones) {
        const pool = i.query(new Rectangle(width / 2, height / 2, width / 2, height / 2));
        for (let j = pool.length - 1; j >= 0; j--) {
            pool[j].value.life--;
            if (pool[j].value.life === 0) {
                pool[j].flagged = true;
            }
            else
                pool[j].value.draw(ctx);
        }
    }
    const pool = Global.food.query(new Rectangle(width / 2, height / 2, width / 2, height / 2));
    for (let i of pool)
        i.value.draw(ctx);
    for (let i of nest.ants) {
        i.steer();
        i.move();
        i.draw(ctx);
    }
    nest.draw(ctx);
}
draw();
document.addEventListener("mousedown", (event) => {
    nest.spawnFood(event.clientX, event.clientY, 50);
});
