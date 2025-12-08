import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];
const iterations = parseInt(argv[3]);
if (!filename) {
  console.error("filename expected");
  exit(1);
}

if (isNaN(iterations)) {
  console.error("iterations expected");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

type Position = {
  x: number;
  y: number;
  z: number;
};

function distance(p: Position, q: Position) {
  return Math.sqrt(
    Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2) + Math.pow(p.z - q.z, 2),
  );
}

function parse(input: string): Position[] {
  return input.split("\n").map((line) => {
    const [x, y, z] = line.split(",").map(Number);
    return { x, y, z };
  });
}

function solution(input: string, iterations: number) {
  const boxes = parse(input).map((val) => ({ ...val, powered: false }));
  const n = boxes.length;

  const distances = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      distances[i][j] = distance(boxes[i], boxes[j]);
    }
  }

  let networks: {
    id: number;
    positions: Set<number>;
  }[] = [];

  let id = 0;

  let min = Infinity;
  let max = -Infinity;
  let minI = -1;
  let minJ = -1;
  let lastPair: [number, number] = [-1, -1];

  while (
    iterations > 0 ||
    networks.length > 1 ||
    networks[0].positions.size !== boxes.length
  ) {
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        if (!distances[i][j]) {
          continue;
        }
        if (distances[i][j] <= max) {
          continue;
        }
        if (min > distances[i][j]) {
          min = distances[i][j];
          minI = i;
          minJ = j;
        }
      }
    }

    lastPair = [minI, minJ];

    let added = false;

    if (!added && boxes[minI].powered && boxes[minJ].powered) {
      const network1 = networks.find((network) => network.positions.has(minI))!;
      const network2 = networks.find((network) => network.positions.has(minJ))!;

      if (network1.id === network2.id) {
        added = true;
      } else {
        for (const pos2 of network2.positions) {
          network1.positions.add(pos2);
        }

        added = true;
        networks = networks.filter((network) => network.id !== network2.id);
      }
    }

    if (!added) {
      for (const network of networks) {
        if (network.positions.has(minI) || network.positions.has(minJ)) {
          boxes[minI].powered = true;
          network.positions.add(minI);
          boxes[minJ].powered = true;
          network.positions.add(minJ);
          added = true;
          break;
        }
      }
    }

    if (!added) {
      boxes[minI].powered = true;
      boxes[minJ].powered = true;
      networks.push({ id: id++, positions: new Set([minI, minJ]) });
    }

    max = min;
    min = Infinity;
    minI = -1;
    minJ = -1;

    iterations--;

    if (iterations === 0) {
      networks.sort((a, b) => b.positions.size - a.positions.size);

      let part1 = 1;
      for (let i = 0; i < 3; ++i) {
        part1 *= networks[i].positions.size;
      }

      console.log("part 1", part1);
    }
  }

  console.log("part 2", boxes[lastPair[0]].x * boxes[lastPair[1]].x);
}

solution(input, iterations);
