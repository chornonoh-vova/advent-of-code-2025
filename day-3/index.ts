import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];

if (!filename) {
  console.error("expect filename");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

const banks = input.split("\n").map((line) => line.split("").map(Number));

function findTotalJoltage(size: number) {
  const maximums: number[] = [];

  for (const batteries of banks) {
    let max = 0;
    let maxIdx = -1;

    for (let s = size - 1; s >= 0; --s) {
      let maxInner = -1;

      for (let i = maxIdx + 1; i < batteries.length - s; ++i) {
        if (batteries[i] > maxInner) {
          maxInner = batteries[i];
          maxIdx = i;
        }
      }

      max = max * 10 + maxInner;
    }

    maximums.push(max);
  }

  return maximums.reduce((prev, curr) => prev + curr, 0);
}

console.log("part 1:", findTotalJoltage(2));
console.log("part 2:", findTotalJoltage(12));
