import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];

if (!filename) {
  console.error("expect filename");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

const ranges = input.split(",").map((r) => r.split("-").map(Number));

const invalid1: number[] = [];

for (const [start, end] of ranges) {
  for (let n = start; n <= end; ++n) {
    const s = n.toString();
    if (s.length % 2 !== 0) {
      continue;
    }

    const [left, right] = [
      s.substring(0, s.length / 2),
      s.substring(s.length / 2),
    ];

    if (left === right) {
      invalid1.push(n);
    }
  }
}

const part1 = invalid1.reduce((prev, curr) => prev + curr, 0);

console.log("part 1:", part1);

const invalid2: number[] = [];

for (const [start, end] of ranges) {
  for (let n = start; n <= end; ++n) {
    const s = n.toString();

    for (let size = 1; size <= Math.floor(s.length / 2); ++size) {
      if (s.length % size !== 0) {
        continue;
      }

      const parts: string[] = [];

      for (let i = 0; i < s.length; i += size) {
        parts.push(s.substring(i, i + size));
      }

      if (parts.every((p) => p === parts[0])) {
        invalid2.push(n);
        break;
      }
    }
  }
}

const part2 = invalid2.reduce((prev, curr) => prev + curr, 0);

console.log("part 2:", part2);
