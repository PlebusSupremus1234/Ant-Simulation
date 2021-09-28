import { Vector } from "./vector.js";
export var PheromoneType;
(function (PheromoneType) {
    PheromoneType[PheromoneType["BLUE"] = 0] = "BLUE";
    PheromoneType[PheromoneType["RED"] = 1] = "RED";
})(PheromoneType || (PheromoneType = {}));
export class Pheromone {
    constructor(x, y, type) {
        this.lifeAmount = 500;
        this.life = this.lifeAmount;
        this.pos = new Vector(x, y);
        this.type = type;
    }
    draw(ctx) {
        let alpha = this.life / this.lifeAmount;
        if (this.type === PheromoneType.BLUE)
            ctx.fillStyle = `rgba(66, 135, 245, ${alpha})`;
        else
            ctx.fillStyle = `rgba(253, 33, 8, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}
