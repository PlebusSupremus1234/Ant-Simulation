import { Vector } from "./vector.js";

export enum PheromoneType {
    BLUE,
    RED
}

export class Pheromone {
    pos: Vector;
    type: PheromoneType;

    readonly lifeAmount = 500;
    life = this.lifeAmount;

    constructor(x: number, y: number, type: PheromoneType) {
        this.pos = new Vector(x, y);
        this.type = type;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        let alpha = this.life / this.lifeAmount;
        if (this.type === PheromoneType.BLUE) ctx.fillStyle = `rgba(66, 135, 245, ${alpha})`;
        else ctx.fillStyle = `rgba(253, 33, 8, ${alpha})`;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}