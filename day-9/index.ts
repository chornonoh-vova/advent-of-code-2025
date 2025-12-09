import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];
if (!filename) {
  console.error("filename expected");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

type Point = [number, number];

function parse(input: string): Point[] {
  return input.split("\n").map((line) => {
    const [x, y] = line.split(",").map(Number);
    return [x, y];
  });
}

function area([x1, y1]: Point, [x2, y2]: Point): number {
  const width = Math.abs(x1 - x2) + 1;
  const height = Math.abs(y1 - y2) + 1;
  return width * height;
}

function findMaxArea(input: string) {
  const points = parse(input);

  let maxArea = -Infinity;

  for (let i = 0; i < points.length - 1; ++i) {
    for (let j = i + 1; j < points.length; ++j) {
      maxArea = Math.max(maxArea, area(points[i], points[j]));
    }
  }

  return maxArea;
}

console.log("part 1", findMaxArea(input));

type Position = {
  x: number;
  y: number;
};

function areaPosition(p: Position, q: Position) {
  return (Math.abs(p.x - q.x) + 1) * (Math.abs(p.y - q.y) + 1);
}

function parsePositions(input: string): Position[] {
  return input.split("\n").map((line) => {
    const [x, y] = line.split(",").map(Number);
    return { x, y };
  });
}

// Helper function to calculate cross product (orientation)
function crossProduct(p: Position, q: Position, r: Position): number {
  return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

/**
 * Checks if two line segments intersect at a single interior point (not at endpoints)
 * @param p1 Start of first segment
 * @param q1 End of first segment
 * @param p2 Start of second segment
 * @param q2 End of second segment
 * @returns true if segments intersect at an interior point, false otherwise (parallel segments always return false)
 */
function segmentsOverlap(
  p1: Position,
  q1: Position,
  p2: Position,
  q2: Position,
): boolean {
  // Calculate cross products
  const o1 = crossProduct(p1, q1, p2);
  const o2 = crossProduct(p1, q1, q2);
  const o3 = crossProduct(p2, q2, p1);
  const o4 = crossProduct(p2, q2, q1);

  // If segments are parallel (all cross products are 0), return false
  if (o1 === 0 && o2 === 0 && o3 === 0 && o4 === 0) {
    return false;
  }

  // Segments intersect if orientations are different (one point on each side)
  if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0) {
    // Check if they have opposite signs (segments cross)
    if (o1 > 0 !== o2 > 0 && o3 > 0 !== o4 > 0) {
      // Calculate intersection point to verify it's not an endpoint
      // Using parametric form: p1 + t*(q1-p1) = p2 + s*(q2-p2)
      const dx1 = q1.x - p1.x;
      const dy1 = q1.y - p1.y;
      const dx2 = q2.x - p2.x;
      const dy2 = q2.y - p2.y;

      const denom = dx1 * dy2 - dy1 * dx2;
      if (denom === 0) return false; // Parallel

      const t = ((p2.x - p1.x) * dy2 - (p2.y - p1.y) * dx2) / denom;
      const s = ((p2.x - p1.x) * dy1 - (p2.y - p1.y) * dx1) / denom;

      // Intersection point must be strictly between endpoints (0 < t < 1 and 0 < s < 1)
      if (t > 0 && t < 1 && s > 0 && s < 1) {
        return true;
      }
    }
  }

  return false;
}

function countLargestArea(input: string): number {
  const positions = parsePositions(input);

  // Helper function to check if point q lies on segment pr (including endpoints)
  function onLineSegment(p: Position, q: Position, r: Position): boolean {
    // Check if q is collinear with p and r
    const cross = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (cross !== 0) return false;

    // Check if q is between p and r
    return (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    );
  }

  // Helper function to check if two points are equal
  function pointsEqual(p1: Position, p2: Position): boolean {
    return p1.x === p2.x && p1.y === p2.y;
  }

  // Create line segments from consecutive points (circular)
  const lineSegments: Array<[Position, Position]> = [];
  for (let i = 0; i < positions.length; i++) {
    const next = (i + 1) % positions.length;
    lineSegments.push([positions[i], positions[next]]);
  }

  let maxArea = 0;

  // Check all pairs of points as opposite corners of axis-aligned rectangles
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];

      // For axis-aligned rectangle, find the four corners
      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);
      const minY = Math.min(p1.y, p2.y);
      const maxY = Math.max(p1.y, p2.y);

      // Skip if points are on same line (would form a line, not a rectangle)
      if (minX === maxX || minY === maxY) {
        continue;
      }

      // Calculate both diagonals
      const diag1Start: Position = { x: minX, y: minY };
      const diag1End: Position = { x: maxX, y: maxY };
      const diag2Start: Position = { x: minX, y: maxY };
      const diag2End: Position = { x: maxX, y: minY };

      // Check if either diagonal intersects with any line segment
      // Invalid if diagonal crosses through a line segment at a point that's NOT a diagonal endpoint
      // (intersection at diagonal endpoint/corner is allowed)
      let isValid = true;
      for (const [segStart, segEnd] of lineSegments) {
        // Check diagonal 1
        // Check if line segment endpoints lie on diagonal (but not at diagonal endpoints)
        const segStartOnDiag1 =
          onLineSegment(diag1Start, segStart, diag1End) &&
          !pointsEqual(segStart, diag1Start) &&
          !pointsEqual(segStart, diag1End);
        const segEndOnDiag1 =
          onLineSegment(diag1Start, segEnd, diag1End) &&
          !pointsEqual(segEnd, diag1Start) &&
          !pointsEqual(segEnd, diag1End);

        // Also check for interior intersection
        const interiorIntersect1 = segmentsOverlap(
          diag1Start,
          diag1End,
          segStart,
          segEnd,
        );

        if (segStartOnDiag1 || segEndOnDiag1 || interiorIntersect1) {
          isValid = false;
          break;
        }

        // Check diagonal 2
        const segStartOnDiag2 =
          onLineSegment(diag2Start, segStart, diag2End) &&
          !pointsEqual(segStart, diag2Start) &&
          !pointsEqual(segStart, diag2End);
        const segEndOnDiag2 =
          onLineSegment(diag2Start, segEnd, diag2End) &&
          !pointsEqual(segEnd, diag2Start) &&
          !pointsEqual(segEnd, diag2End);

        const interiorIntersect2 = segmentsOverlap(
          diag2Start,
          diag2End,
          segStart,
          segEnd,
        );

        if (segStartOnDiag2 || segEndOnDiag2 || interiorIntersect2) {
          isValid = false;
          break;
        }
      }

      // If valid, calculate area and update max
      if (isValid) {
        const currArea = areaPosition(p1, p2);
        if (currArea > maxArea) {
          maxArea = currArea;
        }
      }
    }
  }
  return maxArea;
}

console.log("part 2", countLargestArea(input));
