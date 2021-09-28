import { Pheromone, PheromoneType } from "./pheromone.js";
import { Global } from "./global.js";
import { Rectangle } from "./quadtree.js";
import { Vector, fromAngle, clone } from "./vector.js";
import { lineCollision, dist } from "./helper.js";
const canvas = document.getElementById("canvas");
const pheromoneFrameSpacing = 2;
export class Ant {
    constructor(x, y, direction, nest) {
        this.hasFood = false;
        this.movingToFood = false;
        this.framesUntilPheromone = pheromoneFrameSpacing;
        this.speed = 10;
        this.sight = 100;
        this.FoV = 3 * Math.PI / 4;
        this.steeringStrength = 0.6;
        this.pos = new Vector(x, y);
        this.velocity = fromAngle(direction, 1);
        this.desiredVel = clone(this.velocity);
        this.nest = nest;
    }
    draw(ctx) {
        ctx.fillStyle = "#ffffff";
        const { x, y } = this.pos;
        const h = 30;
        const w = 20;
        const normalized = this.velocity.normalize();
        const vector1 = normalized.rotate(Math.PI);
        const vector2 = normalized.rotate(-Math.PI / 2);
        const vector3 = normalized.rotate(-3 * Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + h * vector1.x + (w / 2) * vector2.x, y + h * vector1.y + (w / 2) * vector2.y);
        ctx.lineTo(x + h * vector1.x + (w / 2) * vector3.x, y + h * vector1.y + (w / 2) * vector3.y);
        ctx.fill();
    }
    steer() {
        if (!this.hasFood)
            this.findFood();
        else {
            if (dist(this.pos.x, this.pos.y, this.nest.pos.x, this.nest.pos.y) < this.nest.radius + this.sight) {
                const bearing = new Vector(this.nest.pos.x - this.pos.x, this.nest.pos.y - this.pos.y);
                this.desiredVel = bearing.normalize();
            }
        }
        if (!this.movingToFood) {
            const [FL, F, FR] = this.countPheromones();
            if ((F > FL) && (F > FR)) { }
            else if (FL > FR)
                this.desiredVel.rotate(-this.FoV / 2, true);
            else if (FR > FL)
                this.desiredVel.rotate(this.FoV / 2, true);
            else { }
        }
        this.avoidObstacles();
        const wanderStrength = 0.05;
        const angle = Math.random() * 2 * Math.PI - Math.PI;
        this.desiredVel.rotate(angle * wanderStrength, true);
        this.applySteer();
    }
    move() {
        this.pos.add(this.velocity.scalarMultiply(this.speed), true);
        if (dist(this.pos.x, this.pos.y, this.nest.pos.x, this.nest.pos.y) < this.nest.radius) {
            if (this.hasFood) {
                this.hasFood = false;
                this.desiredVel.rotate(Math.PI, true);
                this.nest.counter++;
            }
        }
        if (this.framesUntilPheromone === 0) {
            if (this.hasFood)
                Global.redPheromones.insert(new Pheromone(this.pos.x, this.pos.y, PheromoneType.RED));
            else
                Global.bluePheromones.insert(new Pheromone(this.pos.x, this.pos.y, PheromoneType.BLUE));
            this.framesUntilPheromone = pheromoneFrameSpacing;
        }
        else
            this.framesUntilPheromone--;
    }
    applySteer() {
        const subtracted = this.desiredVel.subtract(this.velocity);
        const desiredSteer = subtracted.scalarMultiply(this.steeringStrength);
        const acc = desiredSteer.limit(this.steeringStrength);
        this.velocity.add(acc, true);
        this.velocity.limit(this.speed, true);
    }
    findFood() {
        let minDist = Infinity;
        let closest;
        let index = -1;
        const pool = Global.food.query(new Rectangle(this.pos.x, this.pos.y, 150, 150));
        for (let i = 0; i < pool.length; i++) {
            const distance = dist(this.pos.x, this.pos.y, pool[i].value.pos.x, pool[i].value.pos.y);
            if (distance < minDist) {
                minDist = distance;
                closest = pool[i];
                index = i;
            }
        }
        if (closest && minDist <= this.sight) {
            this.movingToFood = true;
            const bearing = new Vector(closest.value.pos.x - this.pos.x, closest.value.pos.y - this.pos.y);
            this.desiredVel = bearing.normalize();
            if (minDist < 10) {
                this.hasFood = true;
                this.movingToFood = false;
                this.desiredVel.rotate(Math.PI, true);
                closest.flagged = true;
            }
        }
    }
    countPheromones() {
        const sensorAngle = this.FoV / 2;
        const otherAngle = (Math.PI - sensorAngle) / 2;
        const pointDistance = this.sight * Math.sin(sensorAngle) / Math.sin(otherAngle);
        const sensorRadius = Math.floor(pointDistance) / 2;
        const sensors = [
            this.pos.add(this.desiredVel.rotate(-sensorAngle).scalarMultiply(this.sight)),
            this.pos.add(this.desiredVel.scalarMultiply(this.sight)),
            this.pos.add(this.desiredVel.rotate(sensorAngle).scalarMultiply(this.sight))
        ];
        const scores = [0, 0, 0];
        const pool = this.hasFood ? Global.bluePheromones : Global.redPheromones;
        for (let i of pool.query(new Rectangle(this.pos.x, this.pos.y, 150, 150))) {
            const pheromone = i.value;
            const distances = [];
            for (let j of sensors)
                distances.push(dist(pheromone.pos.x, pheromone.pos.y, j.x, j.y));
            for (let j in scores) {
                if (distances[j] < sensorRadius)
                    scores[j] += pheromone.life / pheromone.lifeAmount;
            }
        }
        return scores;
    }
    avoidObstacles() {
        const spacing = Math.PI / 12;
        for (let i = 0; i < 2 * Math.PI / spacing; i++) {
            let multiplier = -i / 2;
            if (i % 2 !== 0)
                multiplier = (i + 1) / 2;
            const newVelocity = this.desiredVel.rotate(multiplier * spacing);
            const sightEnd = this.pos.add(newVelocity.scalarMultiply(this.sight));
            const line = {
                x1: this.pos.x,
                y1: this.pos.y,
                x2: sightEnd.x,
                y2: sightEnd.y
            };
            let collided = false;
            for (let i of Global.obstacles) {
                const collision = lineCollision(line.x1, line.y1, line.x2, line.y2, i.x1, i.y1, i.x2, i.y2);
                if (collision)
                    collided = true;
            }
            if (!collided) {
                this.desiredVel = newVelocity;
                break;
            }
        }
    }
}
