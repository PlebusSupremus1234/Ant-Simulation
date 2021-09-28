const width = window.innerWidth;
const height = window.innerHeight;

import { Food } from "./food.js";
import { Pheromone } from "./pheromone.js";
import { QuadTree, Rectangle } from "./quadtree.js";

const fullScreenRect = new Rectangle(width / 2, height / 2, width / 2, height / 2);

export const Global: {
    food: QuadTree<Food>;
    bluePheromones: QuadTree<Pheromone>;
    redPheromones: QuadTree<Pheromone>;
    obstacles: {
        x1: number, y1: number,
        x2: number, y2: number
    }[];
} = {
    food: new QuadTree<Food>(fullScreenRect, 4),
    bluePheromones: new QuadTree<Pheromone>(fullScreenRect, 4),
    redPheromones: new QuadTree<Pheromone>(fullScreenRect, 4),
    obstacles: [
        // Horizontal
        { x1: 0, y1: 0, x2: width, y2: 0 },
        { x1: 0, y1: height, x2: width, y2: height },

        // Vertical
        { x1: 0, y1: 0, x2: 0, y2: height },
        { x1: width, y1: 0, x2: width, y2: height },
    ]
};