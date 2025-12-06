import { readFile } from "node:fs/promises";
import process from "node:process";

const filename = process.argv[2];
if (!filename) {
  console.error("Expect FileName");
  process.exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

function parse1(input: string) {
  const lines = input.split("\n");

  const nums = lines
    .slice(0, -1)
    .map((line) => line.trim().split(/\s+/).map(Number));
  const operations = lines[lines.length - 1].trim().split(/\s+/);

  return { nums, operations };
}

function calculate({
  nums,
  operations,
}: {
  nums: number[][];
  operations: string[];
}) {
  const result = nums[0];

  for (let i = 1; i < nums.length; ++i) {
    for (let j = 0; j < nums[i].length; ++j) {
      if (operations[j] === "+") {
        result[j] += nums[i][j];
      } else if (operations[j] === "*") {
        result[j] *= nums[i][j];
      }
    }
  }

  return result.reduce((prev, curr) => prev + curr, 0);
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
        if (lines[j][curr]) {
          num += lines[j][curr];
        }
      }

      curr++;

      num = num.trim();

      if (!num) {
        break;
      }

      nums[i].push(Number(num));
    }
  }

  return { nums, operations };
}

function calculate2({
  nums,
  operations,
}: {
  nums: number[][];
  operations: string[];
}) {
  const result = nums.map((col) => col[0]);

  for (let i = 1; i < nums[0].length; ++i) {
    for (let j = 0; j < nums.length; ++j) {
      const num = nums[j][i];
      if (!num) continue;

      if (operations[j] === "+") {
        result[j] += num;
      } else if (operations[j] === "*") {
        result[j] *= num;
      }
    }
  }

  return result.reduce((prev, curr) => prev + curr, 0);
}

console.log("part 2", calculate2(parse2(input)));
