import { Food } from "./food.js";
import { Nest } from "./nest.js";
import { Pheromone, PheromoneType } from "./pheromone.js";

import { Global } from "./global.js";
import { Rectangle, QuadTreeElement } from "./quadtree.js";
import { Vector, fromAngle, clone } from "./vector.js";
import { lineCollision, dist } from "./helper.js";

const canvas = <HTMLCanvasElement> document.getElementById("canvas");

const pheromoneFrameSpacing = 2;

export class Ant {
    pos: Vector;
    velocity: Vector;
    desiredVel: Vector;
    nest: Nest;

    hasFood = false;
    movingToFood = false;
    framesUntilPheromone = pheromoneFrameSpacing;

    readonly speed = 10;
    readonly sight = 100;
    readonly FoV = 3 * Math.PI / 4;
    readonly steeringStrength = 0.6;

    constructor(x: number, y: number, direction: number, nest: Nest) {
        this.pos = new Vector(x, y);
        this.velocity = fromAngle(direction, 1);
        this.desiredVel = clone(this.velocity);

        this.nest = nest;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#ffffff";

        const { x, y } = this.pos;
        const h = 30;
        const w = 20;

        const normalized = this.velocity.normalize();
        const vector1 = normalized.rotate(Math.PI);
        const vector2 = normalized.rotate(-Math.PI / 2);
        const vector3 = normalized.rotate(-3 * Math.PI / 2);

        ctx.beginPath();

        ctx.moveTo(x, y); // Point 1
        ctx.lineTo( // Point 2
            x + h * vector1.x + (w / 2) * vector2.x,
            y + h * vector1.y + (w / 2) * vector2.y
        );
        ctx.lineTo( // Point 3
            x + h * vector1.x + (w / 2) * vector3.x,
            y + h * vector1.y + (w / 2) * vector3.y
        );

        ctx.fill();
    }

    public steer() {
        // Check for food in the ant's FoV
        if (!this.hasFood) this.findFood();
        else {
            // Check if nest is in radius
            if (dist(this.pos.x, this.pos.y, this.nest.pos.x, this.nest.pos.y) < this.nest.radius + this.sight) {
                const bearing = new Vector(this.nest.pos.x - this.pos.x, this.nest.pos.y - this.pos.y);
                this.desiredVel = bearing.normalize();
            }
        }

        // Check for pheromones
        if (!this.movingToFood) {
            const [FL, F, FR] = this.countPheromones();

            if ((F > FL) && (F > FR)) {}
            else if (FL > FR) this.desiredVel.rotate(-this.FoV / 2, true);
            else if (FR > FL) this.desiredVel.rotate(this.FoV / 2, true);
            else {}
        }

        // Avoid obstacles
        this.avoidObstacles();

        // Slight random wander
        const wanderStrength = 0.05;
        const angle = Math.random() * 2 * Math.PI - Math.PI;
        this.desiredVel.rotate(angle * wanderStrength, true);

        // Steer the ant
        this.applySteer();
    }

    public move() {
        this.pos.add(this.velocity.scalarMultiply(this.speed), true);

        if (dist(this.pos.x, this.pos.y, this.nest.pos.x, this.nest.pos.y) < this.nest.radius) {
            if (this.hasFood) {
                this.hasFood = false;
                this.desiredVel.rotate(Math.PI, true);
                this.nest.counter++;
            }
        }

        if (this.framesUntilPheromone === 0) {
            if (this.hasFood) Global.redPheromones.insert(new Pheromone(this.pos.x, this.pos.y, PheromoneType.RED));
            else Global.bluePheromones.insert(new Pheromone(this.pos.x, this.pos.y, PheromoneType.BLUE));

            this.framesUntilPheromone = pheromoneFrameSpacing;
        } else this.framesUntilPheromone--;
    }

    private applySteer(): void {
        const subtracted = this.desiredVel.subtract(this.velocity);
        const desiredSteer = subtracted.scalarMultiply(this.steeringStrength);
        const acc = desiredSteer.limit(this.steeringStrength);

        this.velocity.add(acc, true);
        this.velocity.limit(this.speed, true);
    }

    private findFood() {
        let minDist = Infinity;
        let closest: QuadTreeElement<Food>;
        let index = -1;

        const pool = Global.food.query(new Rectangle<Food>(this.pos.x, this.pos.y, 150, 150));

        for (let i = 0; i < pool.length; i++) {
            const distance = dist(
                this.pos.x, this.pos.y,
                pool[i].value.pos.x, pool[i].value.pos.y
            );

            if (distance < minDist) {
                // Check for collisions
                let collided = false;
                for (let j of Global.obstacles) {
                    if (lineCollision(
                        this.pos.x, this.pos.y,
                        pool[i].value.pos.x, pool[i].value.pos.y,
                        j.x1, j.y1,
                        j.x2, j.y2
                    )) collided = true;
                }

                if (collided) continue;

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

    private countPheromones(): [number, number, number] {
        const sensorAngle = this.FoV / 2;
        const otherAngle = (Math.PI - sensorAngle) / 2;
        const pointDistance = this.sight * Math.sin(sensorAngle) / Math.sin(otherAngle);
        const sensorRadius = Math.floor(pointDistance) / 2;

        const sensors = [
            this.pos.add(this.desiredVel.rotate(-sensorAngle).scalarMultiply(this.sight)),
            this.pos.add(this.desiredVel.scalarMultiply(this.sight)),
            this.pos.add(this.desiredVel.rotate(sensorAngle).scalarMultiply(this.sight))
        ];

        const scores: [number, number, number] = [0, 0, 0];

        const pool = this.hasFood ? Global.bluePheromones : Global.redPheromones;
        for (let i of pool.query(new Rectangle(this.pos.x, this.pos.y, 150, 150))) {
            const pheromone = i.value;
            const distances = [];
            for (let j of sensors) distances.push(dist(pheromone.pos.x, pheromone.pos.y, j.x, j.y));

            for (let j in scores) {
                if (distances[j] < sensorRadius) scores[j] += pheromone.life / pheromone.lifeAmount;
            }
        }

        return scores;
    }

    private avoidObstacles() {
        // Scan routes starting from the desired direction and check if it collides
        const spacing = Math.PI / 12;
        for (let i = 0; i < 2 * Math.PI / spacing; i++) {
            let multiplier = -i / 2;
            if (i % 2 !== 0) multiplier = (i + 1) / 2;
            const newVelocity = this.desiredVel.rotate(multiplier * spacing);

            // Check for any obstacles
            const sightEnd = this.pos.add(newVelocity.scalarMultiply(this.sight));
            const line = {
                x1: this.pos.x,
                y1: this.pos.y,
                x2: sightEnd.x,
                y2: sightEnd.y
            };

            let collided = false;
            for (let i of Global.obstacles) {
                const collision = lineCollision(
                    line.x1, line.y1,
                    line.x2, line.y2,
                    i.x1, i.y1,
                    i.x2, i.y2
                );

                if (collision) collided = true;
            }

            // If no collision, break and set the velocity
            if (!collided) {
                this.desiredVel = newVelocity;
                break;
            }
        }
    }
}