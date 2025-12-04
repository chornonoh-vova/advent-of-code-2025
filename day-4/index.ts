import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];

if (!filename) {
  console.error("expect filename");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

const initialGrid = input.split("\n").map((line) => line.split(""));

const ROLL = "@";
const EMPTY = ".";

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function countAccessibleRolls(grid: string[][]) {
  const n = grid.length;
  const m = grid[0].length;

  let accessible = 0;

  for (let row = 0; row < n; ++row) {
    for (let col = 0; col < m; ++col) {
      if (grid[row][col] !== ROLL) {
        continue;
      }

      let adjRolls = 0;

      for (const [dr, dc] of directions) {
        const [r, c] = [row + dr, col + dc];

        if (r >= 0 && r < n && c >= 0 && c < m && grid[r][c] === ROLL) {
          adjRolls++;
        }
      }

      if (adjRolls < 4) {
        accessible++;
      }
    }
  }

  return accessible;
}

console.log("part 1", countAccessibleRolls(initialGrid));

function countRemovableRolls(grid: string[][]) {
  const n = grid.length;
  const m = grid[0].length;

  let removable = 0;

  while (countAccessibleRolls(grid) !== 0) {
    const toRemove = new Set<string>();

    for (let row = 0; row < n; ++row) {
      for (let col = 0; col < m; ++col) {
        if (grid[row][col] !== ROLL) {
          continue;
        }

        let adjRolls = 0;

        for (const [dr, dc] of directions) {
          const [r, c] = [row + dr, col + dc];

          if (r >= 0 && r < n && c >= 0 && c < m && grid[r][c] === ROLL) {
            adjRolls++;
          }
        }

        if (adjRolls < 4) {
          toRemove.add(`${row}-${col}`);
        }
      }
    }

    for (const rollPos of toRemove) {
      const [row, col] = rollPos.split("-").map(Number);
      grid[row][col] = EMPTY;
      removable++;
    }
  }

  return removable;
}

console.log("part 2", countRemovableRolls(initialGrid));
