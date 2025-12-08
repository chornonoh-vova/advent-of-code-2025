import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

import { MinPriorityQueue } from "@datastructures-js/priority-queue";

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

function first<K, V>(map: Map<K, V>): V {
  return map.values().next().value;
}

function solution(input: string, iterations: number) {
  const boxes = parse(input);

  const n = boxes.length;

  const minDistances = new MinPriorityQueue<{
    boxes: [number, number];
    distance: number;
  }>((item) => item.distance);

  for (let i = 0; i < n; ++i) {
    for (let j = i + 1; j < n; ++j) {
      minDistances.enqueue({
        boxes: [i, j],
        distance: distance(boxes[i], boxes[j]),
      });
    }
  }

  let id = 0;

  const powered = new Array(n).fill(false);

  const networks = new Map<number, Set<number>>();
  const boxToNetwork = new Map<number, number>();

  let box1 = -1,
    box2 = -1;

  while (
    iterations > 0 ||
    networks.size > 1 ||
    first(networks).size !== boxes.length
  ) {
    const min = minDistances.dequeue()!;
    [box1, box2] = min.boxes;

    if (powered[box1] && powered[box2]) {
      const network1 = boxToNetwork.get(box1)!;
      const network2 = boxToNetwork.get(box2)!;

      if (network1 !== network2) {
        for (const pos2 of networks.get(network2)!) {
          networks.get(network1)!.add(pos2);
          boxToNetwork.set(pos2, network1);
        }

        networks.delete(network2);
      }
    } else if (boxToNetwork.has(box1) || boxToNetwork.has(box2)) {
      powered[box1] = true;
      powered[box2] = true;

      const networkId = (boxToNetwork.get(box1) ?? boxToNetwork.get(box2))!;

      networks.get(networkId)!.add(box1);
      networks.get(networkId)!.add(box2);

      boxToNetwork.set(box1, networkId);
      boxToNetwork.set(box2, networkId);
    } else {
      powered[box1] = true;
      powered[box2] = true;

      const networkId = id++;

      networks.set(networkId, new Set([box1, box2]));

      boxToNetwork.set(box1, networkId);
      boxToNetwork.set(box2, networkId);
    }

    iterations--;

    if (iterations === 0) {
      const networksSnapshot = Array.from(networks.values());
      networksSnapshot.sort((a, b) => b.size - a.size);

      let part1 = 1;
      for (let i = 0; i < 3; ++i) {
        part1 *= networksSnapshot[i].size;
      }

      console.log("part 1", part1);
    }
  }

  console.log("part 2", boxes[box1].x * boxes[box2].x);
}

solution(input, iterations);
