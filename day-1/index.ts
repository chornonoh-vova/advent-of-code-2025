import { readFile } from "node:fs/promises";
import process from "node:process";

const filename = process.argv[2];

const instructions = (await readFile(filename, "utf-8")).trim().split("\n");

class Safe {
  #dial: number;
  part1: number;
  part2: number;

  constructor(initial: number) {
    this.#dial = initial;
    this.part1 = 0;
    this.part2 = 0;
  }

  turn(direction: "L" | "R", amount: number) {
    const dir = direction === "L" ? -1 : 1;

    for (let i = 0; i < amount; ++i) {
      this.#dial += dir;
      this.#dial %= 100;

      if (!this.#dial) {
        this.part2++;
      }
    }

    if (!this.#dial) {
      this.part1++;
    }
  }
}

const safe = new Safe(50);

for (const instruction of instructions) {
  const direction = instruction.substring(0, 1) as "L" | "R";
  const amount = parseInt(instruction.substring(1));

  safe.turn(direction, amount);
}

console.log("part 1:", safe.part1);
console.log("part 2:", safe.part2);
