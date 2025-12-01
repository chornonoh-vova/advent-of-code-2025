import { readFile } from "node:fs/promises";
import process from "node:process";

const filename = process.argv[2];

const instructions = (await readFile(filename, "utf-8")).trim().split("\n");

class Safe {
  #dial: number;
  cnt: number;

  constructor(initial: number) {
    this.#dial = initial;
    this.cnt = 0;
  }

  turnLeft(amount: number) {
    for (let i = 0; i < amount; ++i) {
      this.#dial--;
      if (this.#dial < 0) {
        this.#dial += 100;
      }
      if (this.#dial === 0) {
        this.cnt++;
      }
    }
  }

  turnRight(amount: number) {
    for (let i = 0; i < amount; ++i) {
      this.#dial++;
      this.#dial %= 100;

      if (this.#dial === 0) {
        this.cnt++;
      }
    }
  }
}

const safe = new Safe(50);

for (const instruction of instructions) {
  const dir = instruction.substring(0, 1);
  const amount = parseInt(instruction.substring(1));

  if (dir === "L") {
    safe.turnLeft(amount);
  } else {
    safe.turnRight(amount);
  }
}

console.log("counter:", safe.cnt);
