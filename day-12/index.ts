import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];
if (!filename) {
  console.error("filename expected");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

type Cell = {
  row: number;
  col: number;
};

type Region = {
  width: number;
  height: number;
  counts: Map<number, number>;
};

function parse(input: string) {
  const elements: Cell[][] = [];
  const regions: Region[] = [];

  const lines = input.split("\n\n");

  for (const line of lines) {
    if (line.match(/^\d:/)) {
      const elementStr = line
        .substring(3)
        .split("\n")
        .map((l) => l.split(""));
      const element: Cell[] = [];
      for (let row = 0; row < elementStr.length; ++row) {
        for (let col = 0; col < elementStr[row].length; ++col) {
          if (elementStr[row][col] === "#") {
            element.push({ row, col });
          }
        }
      }
      elements.push(element);
    } else {
      for (const regionStr of line.split("\n")) {
        const [size, required] = regionStr.split(": ");
        const [width, height] = size.split("x").map(Number);
        const counts = new Map<number, number>();

        const presentCounts = required.split(" ").map(Number);

        for (let i = 0; i < presentCounts.length; ++i) {
          counts.set(i, presentCounts[i]);
        }

        regions.push({
          width,
          height,
          counts,
        });
      }
    }
  }

  return { elements, regions };
}

function rotate(element: Cell[]) {
  const maxRow = Math.max(...element.map((c) => c.row));

  return element.map(({ row, col }) => ({
    row: col,
    col: maxRow - row,
  }));
}

function flipHorizontal(element: Cell[]) {
  const minCol = Math.min(...element.map((c) => c.col));
  const maxCol = Math.max(...element.map((c) => c.col));

  return element.map(({ row, col }) => ({
    row,
    col: maxCol - (col - minCol),
  }));
}

function generateRotations(element: Cell[]) {
  const result: Cell[][] = [];

  let current = element;

  for (let r = 0; r < 4; ++r) {
    result.push(current);
    result.push(flipHorizontal(current));

    current = rotate(current);
  }

  return result;
}

function generatePlacements({ width, height }: Region, element: Cell[]) {
  const placements: bigint[] = [];

  const maxRow = Math.max(...element.map((c) => c.row));
  const maxCol = Math.max(...element.map((c) => c.col));

  for (let row = 0; row + maxRow < height; ++row) {
    for (let col = 0; col + maxCol < width; ++col) {
      let mask = 0n;

      for (const c of element) {
        const id = BigInt((row + c.row) * width + (col + c.col));
        mask |= 1n << id;
      }

      placements.push(mask);
    }
  }

  return placements;
}

function isValidRegion(region: Region, elements: Cell[][]) {
  console.log("checking: ", region.width + "x" + region.height, region.counts);
  const regionSize = region.width * region.height;

  let elementsSize = 0;

  for (const [elementIdx, elementRequired] of region.counts) {
    if (!elementRequired) continue;

    const element = elements[elementIdx];
    const elementSize = element.length;
    elementsSize += elementSize * elementRequired;
  }

  if (regionSize < elementsSize) {
    console.log("valid:", false);
    return false;
  }

  const variants = new Map<number, Set<bigint>>();

  for (const [elementIdx, elementRequired] of region.counts) {
    if (!elementRequired) continue;

    const element = elements[elementIdx];
    const rotations = generateRotations(element);
    const placements = new Set<bigint>();

    for (const rotation of rotations) {
      generatePlacements(region, rotation).forEach((placement) => {
        placements.add(placement);
      });
    }

    variants.set(elementIdx, placements);
  }

  const instances: { shape: number }[] = [];
  for (const [shape, counts] of region.counts) {
    for (let c = 0; c < counts; ++c) {
      instances.push({ shape });
    }
  }

  instances.sort((a, b) => elements[b.shape].length - elements[a.shape].length);

  function backtrack(idx: number, occupied: bigint) {
    if (idx === instances.length) return true;

    const shape = instances[idx].shape;
    const options = variants.get(shape)!;

    for (const mask of options) {
      if ((mask & occupied) !== 0n) continue;

      if (backtrack(idx + 1, occupied | mask)) {
        return true;
      }
    }

    return false;
  }

  const valid = backtrack(0, 0n);
  console.log("valid:", valid);
  return valid;
}

function part1(input: string) {
  const { elements, regions } = parse(input);

  let count = 0;

  for (const region of regions) {
    if (isValidRegion(region, elements)) {
      count++;
    }
  }

  return count;
}

console.log("part 1", part1(input));
