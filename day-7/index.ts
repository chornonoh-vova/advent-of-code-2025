import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];
if (!filename) {
  console.error("filename expected");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

const START = "S";
const SPLITTER = "^";

type Position = {
  row: number;
  col: number;
};

type Parsed = {
  grid: string[][];
  start: Position;
};

function parse(input: string): Parsed {
  const grid = input.split("\n").map((line) => line.split(""));

  const startCol = grid[0].indexOf(START);

  return {
    grid,
    start: { row: 0, col: startCol },
  };
}

function countBeamSplits({ grid, start }: Parsed) {
  let cnt = 0;

  let beams = [start];

  for (let i = 1; i < grid.length; ++i) {
    const nextBeams: Position[] = [];

    for (const { row, col } of beams) {
      const nextRow = row + 1;

      if (grid[row][col] === SPLITTER) {
        nextBeams.push({ row: nextRow, col: col - 1 });
        nextBeams.push({ row: nextRow, col: col + 1 });
        cnt++;
      } else {
        nextBeams.push({ row: nextRow, col });
      }
    }

    beams = [];

    for (const { row, col } of nextBeams) {
      const foundIdx = beams.findIndex((b) => b.row === row && b.col === col);
      if (foundIdx === -1) {
        beams.push({ row, col });
      }
    }
  }

  return cnt;
}

console.log("part 1", countBeamSplits(parse(input)));

function countTimelines({ grid, start }: Parsed) {
  const counts = new Map<string, number>();

  function dfs({ row, col }: Position) {
    if (row === grid.length) {
      return 1;
    }

    const key = `${row}-${col}`;

    if (counts.has(key)) {
      return counts.get(key)!;
    }

    let result: number;

    const nextRow = row + 1;

    if (grid[row][col] === SPLITTER) {
      result =
        dfs({ row: nextRow, col: col - 1 }) +
        dfs({ row: nextRow, col: col + 1 });
    } else {
      result = dfs({ row: nextRow, col });
    }

    counts.set(key, result);

    return result;
  }

  return dfs(start);
}

console.log("part 2", countTimelines(parse(input)));
