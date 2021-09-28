import { Vector } from "./vector.js";
export class Food {
    constructor(x, y) {
        this.pos = new Vector(x, y);
    }
    draw(ctx) {
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}
