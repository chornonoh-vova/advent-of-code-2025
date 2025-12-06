import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];
if (!filename) {
  console.error("filename expected");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

function parse1(input: string) {
  let lines = input.split("\n");

  const parsed = lines
    .slice(0, -1)
    .map((line) => line.trim().split(/\s+/).map(Number));

  const operations = lines[lines.length - 1].trim().split(/\s+/);

  const nums: number[][] = [];

  for (let i = 0; i < operations.length; ++i) {
    const col: number[] = [];

    for (let j = 0; j < parsed.length; ++j) {
      col.push(parsed[j][i]);
    }

    nums.push(col);
  }

  return { nums, operations };
}

function calculate({
  nums,
  operations,
}: {
  nums: number[][];
  operations: string[];
}) {
  return nums
    .map((col, idx) => {
      let total = col[0];
      const op = operations[idx];

      for (let i = 1; i < col.length; ++i) {
        if (op === "+") {
          total += col[i];
        } else if (op === "*") {
          total *= col[i];
        }
      }

      return total;
    })
    .reduce((prev, curr) => prev + curr, 0);
}

console.log("part 1", calculate(parse1(input)));

function parse2(input: string) {
  let lines = input.split("\n");

  const operations = lines[lines.length - 1].trim().split(/\s+/);

  lines = lines.slice(0, -1);

  const nums: number[][] = Array.from({ length: operations.length }, () => []);

  let curr = 0;

  for (let i = 0; i < operations.length; ++i) {
    while (curr < lines[0].length) {
      let num = "";

      for (let j = 0; j < lines.length; ++j) {
        num += lines[j][curr];
      }

      curr++;

      num = num.trim();

      if (!num) break;

      nums[i].push(Number(num));
    }
  }

  return { nums, operations };
}

console.log("part 2", calculate(parse2(input)));
