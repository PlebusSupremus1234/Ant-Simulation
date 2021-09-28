import { Vector } from "./vector.js";
import { Ant } from "./ant.js";
import { dist } from "./helper.js";
import { Global } from "./global.js";
import { Food } from "./food.js";

export class Nest {
    pos: Vector;
    ants: Ant[] = [];
    counter = 0;

    readonly radius = 50;

    constructor(x: number, y: number, antAmount: number) {
        this.pos = new Vector(x, y);

        const spacing = 2 * Math.PI / antAmount;
        for (let i = 0; i < antAmount; i++) this.ants.push(new Ant(x, y, i * spacing, this));
    }


    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#ce5114";

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "30px Comic Sans MS";
        ctx.textAlign = "center";
        ctx.fillText(`${this.counter}`, this.pos.x, this.pos.y + 8);
    }

    public spawnFood(x: number, y: number, radius: number) {
        for (let i = -radius; i < radius; i += 10) {
            for (let j = -radius; j < radius; j += 10) {
                if (dist(x, y, x + i, y + j) < radius) Global.food.insert(new Food(x + i, y + j));
            }
        }
    }
}