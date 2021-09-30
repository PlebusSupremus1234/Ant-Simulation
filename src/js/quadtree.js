export class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(point) {
        return (point.pos.x >= this.x - this.w &&
            point.pos.x < this.x + this.w &&
            point.pos.y >= this.y - this.h &&
            point.pos.y < this.y + this.h);
    }
    intersects(range) {
        return !(range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h);
    }
}
export class QuadTreeElement {
    constructor(value) {
        this.flagged = false;
        this.value = value;
    }
}
export class QuadTree {
    constructor(boundary, capacity, parent = null) {
        this.points = [];
        this.divided = false;
        this.northeast = null;
        this.northwest = null;
        this.southeast = null;
        this.southwest = null;
        this.boundary = boundary;
        this.capacity = capacity;
        this.parent = parent;
    }
    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;
        let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
        this.northeast = new QuadTree(ne, this.capacity, this);
        let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
        this.northwest = new QuadTree(nw, this.capacity, this);
        let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
        this.southeast = new QuadTree(se, this.capacity, this);
        let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
        this.southwest = new QuadTree(sw, this.capacity, this);
        this.divided = true;
    }
    insert(point) {
        if (!this.boundary.contains(point))
            return false;
        if (this.points.length < this.capacity) {
            this.points.push(new QuadTreeElement(point));
            return true;
        }
        else {
            if (!this.divided)
                this.subdivide();
            if (this.northeast.insert(point))
                return true;
            else if (this.northwest.insert(point))
                return true;
            else if (this.southeast.insert(point))
                return true;
            else if (this.southwest.insert(point))
                return true;
        }
    }
    query(range, found = []) {
        if (!this.boundary.intersects(range))
            return [];
        else {
            for (let i = this.points.length - 1; i >= 0; i--) {
                let p = this.points[i];
                if (p.flagged) {
                    [
                        this.points[i],
                        this.points[this.points.length - 1]
                    ] = [
                        this.points[this.points.length - 1],
                        this.points[i]
                    ];
                    this.points.pop();
                }
                else {
                    if (range.contains(p.value))
                        found.push(p);
                }
            }
            if (this.divided) {
                if (this.northwest)
                    this.northwest.query(range, found);
                if (this.northeast)
                    this.northeast.query(range, found);
                if (this.southwest)
                    this.southwest.query(range, found);
                if (this.southeast)
                    this.southeast.query(range, found);
            }
        }
        return found;
    }
}
