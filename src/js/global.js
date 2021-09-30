const width = window.innerWidth;
const height = window.innerHeight;
import { QuadTree, Rectangle } from "./quadtree.js";
const fullScreenRect = new Rectangle(width / 2, height / 2, width / 2, height / 2);
export const Global = {
    food: new QuadTree(fullScreenRect, 4),
    bluePheromones: new QuadTree(fullScreenRect, 4),
    redPheromones: new QuadTree(fullScreenRect, 4),
    tool: 0,
    isBeingDragged: false,
    obstacles: [
        { x1: 0, y1: 0, x2: width, y2: 0 },
        { x1: 0, y1: height, x2: width, y2: height },
        { x1: 0, y1: 0, x2: 0, y2: height },
        { x1: width, y1: 0, x2: width, y2: height },
    ]
};
