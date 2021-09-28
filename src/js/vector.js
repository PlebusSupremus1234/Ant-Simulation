export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    assign(other) {
        this.x = other.x;
        this.y = other.y;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize(change = false) {
        const vector = this.scalarMultiply(1 / this.magnitude());
        if (change)
            this.assign(vector);
        return vector;
    }
    add(other, change = false) {
        const vector = new Vector(this.x + other.x, this.y + other.y);
        if (change)
            this.assign(vector);
        return vector;
    }
    subtract(other, change = false) {
        const vector = new Vector(this.x - other.x, this.y - other.y);
        if (change)
            this.assign(vector);
        return vector;
    }
    scalarMultiply(scalar, change = false) {
        const vector = new Vector(scalar * this.x, scalar * this.y);
        if (change)
            this.assign(vector);
        return vector;
    }
    rotate(angle, change = false) {
        const vector = new Vector(Math.cos(angle) * this.x - Math.sin(angle) * this.y, Math.sin(angle) * this.x + Math.cos(angle) * this.y);
        if (change)
            this.assign(vector);
        return vector;
    }
    limit(max, change = false) {
        const vector = this.magnitude() > max ? this.normalize().scalarMultiply(max) : this;
        if (change)
            this.assign(vector);
        return vector;
    }
}
export function fromAngle(angle, magnitude) {
    return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
}
export function clone(vector) {
    return new Vector(vector.x, vector.y);
}
