import { readFile } from "node:fs/promises";
import process from "node:process";

const filename = process.argv[2];
if (!filename) {
  console.error("Expect FileName");
  process.exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

function parse(input: string) {
  const [freshRangerStr, availableIngredientsStr] = input.split("\n\n");

  const freshRanges = freshRangerStr
    .split("\n")
    .map((line) => line.split("-").map(Number));

  freshRanges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const availableIngredients = availableIngredientsStr.split("\n").map(Number);

  return { freshRanges, availableIngredients };
}

function merge(ranges: number[][]) {
  const merged = [ranges[0]];

  for (let i = 1; i < ranges.length; i++) {
    const lastEnd = merged[merged.length - 1][1];
    const [nextStart, nextEnd] = ranges[i];

    if (nextStart <= lastEnd) {
      merged[merged.length - 1][1] = Math.max(lastEnd, nextEnd);
    } else {
      merged.push(ranges[i]);
    }
  }

  return merged;
}

function countFreshAvailable() {
  const { freshRanges, availableIngredients } = parse(input);
  const mergedFreshRanges = merge(freshRanges);

  let cnt = 0;

  for (const available of availableIngredients) {
    for (const [start, end] of mergedFreshRanges) {
      if (available >= start && available <= end) {
        cnt++;
      }
    }
  }

  return cnt;
}

console.log("part 1", countFreshAvailable());

function countAllFresh() {
  const { freshRanges } = parse(input);
  const mergedFreshRanges = merge(freshRanges);

  let cnt = 0;

  for (const [start, end] of mergedFreshRanges) {
    cnt += end - start + 1;
  }

  return cnt;
}

console.log("part 2", countAllFresh());
