import { Vector } from "./vector.js";

export class Food {
    pos: Vector;

    constructor(x: number, y: number) {
        this.pos = new Vector(x, y);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}