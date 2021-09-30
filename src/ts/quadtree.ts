export class Rectangle<T> {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    public contains(point: T): boolean {
        return (
            (point as any).pos.x >= this.x - this.w &&
            (point as any).pos.x < this.x + this.w &&
            (point as any).pos.y >= this.y - this.h &&
            (point as any).pos.y < this.y + this.h
        );
    }

    public intersects(range: Rectangle<T>): boolean {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h
        );
    }
}

export class QuadTreeElement<T> {
    value: T;
    flagged = false;

    constructor(value: T) {
        this.value = value;
    }
}

export class QuadTree<T> {
    boundary: Rectangle<T>;
    capacity: number;
    parent: QuadTree<T> | null;

    points: QuadTreeElement<T>[] = [];
    divided = false;

    northeast: null | QuadTree<T> = null;
    northwest: null | QuadTree<T> = null;
    southeast: null | QuadTree<T> = null;
    southwest: null | QuadTree<T> = null;

    constructor(boundary: Rectangle<T>, capacity: number, parent: QuadTree<T> | null = null) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.parent = parent;
    }

    public subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;

        let ne = new Rectangle<T>(x + w / 2, y - h / 2, w / 2, h / 2);
        this.northeast = new QuadTree<T>(ne, this.capacity, this);
        let nw = new Rectangle<T>(x - w / 2, y - h / 2, w / 2, h / 2);
        this.northwest = new QuadTree<T>(nw, this.capacity, this);
        let se = new Rectangle<T>(x + w / 2, y + h / 2, w / 2, h / 2);
        this.southeast = new QuadTree(se, this.capacity, this);
        let sw = new Rectangle<T>(x - w / 2, y + h / 2, w / 2, h / 2);
        this.southwest = new QuadTree(sw, this.capacity, this);

        this.divided = true;
    }

    public insert(point: T) {
        if (!this.boundary.contains(point)) return false;

        if (this.points.length < this.capacity) {
            this.points.push(new QuadTreeElement(point));
            return true;
        } else {
            if (!this.divided) this.subdivide();

            if (this.northeast.insert(point)) return true;
            else if (this.northwest.insert(point)) return true;
            else if (this.southeast.insert(point)) return true;
            else if (this.southwest.insert(point)) return true;
        }
    }

    public query(range, found: QuadTreeElement<T>[] = []): QuadTreeElement<T>[] {
        if (!this.boundary.intersects(range)) return [];
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
                    if (range.contains(p.value)) found.push(p);
                }
            }

            if (this.divided) {
                if (this.northwest) this.northwest.query(range, found);
                if (this.northeast) this.northeast.query(range, found);
                if (this.southwest) this.southwest.query(range, found);
                if (this.southeast) this.southeast.query(range, found);
            }
        }

        return found;
    }
}