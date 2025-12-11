import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];
if (!filename) {
  console.error("filename expected");
  exit(1);
}

const start = argv[3] || "you";
const required1 = argv[4];
const required2 = argv[5];

const input = (await readFile(filename, "utf-8")).trim();

const OUT = "out";

function parse(input: string) {
  const graph = new Map<string, string[]>();

  for (const line of input.split("\n")) {
    const parts = line.split(" ");
    graph.set(parts[0].substring(0, parts[0].length - 1), parts.slice(1));
  }

  return graph;
}

function countPaths(input: string) {
  const graph = parse(input);

  const memo = new Map<string, number>();

  function dfs(curr: string): number {
    if (curr === OUT) return 1;

    if (memo.has(curr)) {
      return memo.get(curr)!;
    }

    let total = 0;

    for (const next of graph.get(curr)!) {
      total += dfs(next);
    }

    memo.set(curr, total);

    return total;
  }

  return dfs(start);
}

console.log("part 1", countPaths(input));

function countPathsWithRequired(input: string) {
  const graph = parse(input);

  const memo = new Map<string, number>();

  function dfs(curr: string, has1: boolean, has2: boolean): number {
    if (curr === OUT) {
      return Number(has1 && has2);
    }

    const key = `${curr}|${has1}|${has2}`;

    if (memo.has(key)) return memo.get(key)!;

    const next1 = has1 || curr === required1;
    const next2 = has2 || curr === required2;

    let total = 0;

    for (const next of graph.get(curr)!) {
      total += dfs(next, next1, next2);
    }

    memo.set(key, total);

    return total;
  }

  return dfs(start, false, false);
}

console.log("part 2", countPathsWithRequired(input));
