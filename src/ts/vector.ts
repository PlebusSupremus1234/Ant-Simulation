export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    private assign(other: Vector): void {
        this.x = other.x;
        this.y = other.y;
    }

    public magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(change = false): Vector {
        const vector = this.scalarMultiply(1 / this.magnitude());

        if (change) this.assign(vector);
        return vector;
    }

    public add(other: Vector, change = false): Vector {
        const vector = new Vector(
            this.x + other.x,
            this.y + other.y
        );

        if (change) this.assign(vector);
        return vector;
    }

    public subtract(other: Vector, change = false): Vector {
        const vector = new Vector(
            this.x - other.x,
            this.y - other.y
        );

        if (change) this.assign(vector);
        return vector;
    }

    public scalarMultiply(scalar: number, change = false): Vector {
        const vector = new Vector(
            scalar * this.x,
            scalar * this.y
        );

        if (change) this.assign(vector);
        return vector;
    }

    public rotate(angle: number, change = false): Vector {
        const vector = new Vector(
            Math.cos(angle) * this.x - Math.sin(angle) * this.y,
            Math.sin(angle) * this.x + Math.cos(angle) * this.y
        );

        if (change) this.assign(vector);
        return vector;
    }

    public limit(max: number, change = false): Vector {
        const vector = this.magnitude() > max ? this.normalize().scalarMultiply(max) : this;

        if (change) this.assign(vector);
        return vector;
    }
}

export function fromAngle(angle: number, magnitude: number): Vector {
    return new Vector(
        Math.cos(angle) * magnitude,
        Math.sin(angle) * magnitude
    );
}

export function clone(vector: Vector): Vector {
    return new Vector(vector.x, vector.y);
}