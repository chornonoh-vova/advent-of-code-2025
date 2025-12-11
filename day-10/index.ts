import { PriorityQueue } from "@datastructures-js/priority-queue";
import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

const filename = argv[2];
if (!filename) {
  console.error("filename expected");
  exit(1);
}

const input = (await readFile(filename, "utf-8")).trim();

type LightState = {
  lights: number;
  presses: number;
};

class Machine {
  requiredLights: number;
  lightButtons: number[];
  joltageButtons: number[][];
  requiredJoltages: number[];

  constructor(
    requiredLights: number,
    lightButtons: number[],
    joltageButtons: number[][],
    requiredJoltages: number[],
  ) {
    this.requiredLights = requiredLights;
    this.lightButtons = lightButtons;
    this.joltageButtons = joltageButtons;
    this.requiredJoltages = requiredJoltages;
  }

  minLightButtonPresses() {
    const best = new Map<number, number>();
    const queue = new PriorityQueue<LightState>(
      (a, b) => a.presses - b.presses,
      [{ lights: 0, presses: 0 }],
    );

    while (!queue.isEmpty()) {
      const { lights, presses } = queue.dequeue()!;

      if (lights === this.requiredLights) return presses;

      if (best.has(lights) && best.get(lights)! <= presses) continue;

      best.set(lights, presses);

      for (const button of this.lightButtons) {
        queue.enqueue({
          lights: lights ^ button,
          presses: presses + 1,
        });
      }
    }

    return -1;
  }

  minJoltageButtonPresses() {
    const overallTarget = this.requiredJoltages;
    const buttons = this.joltageButtons;

    let best = 1 / 0;

    const solveFrom = (state: number[], sofar: number, buttons: number[][]) => {
      let stepsLeft = 0;
      for (let i = 0; i < state.length; i++) {
        if (state[i] < 0) {
          return;
        }
        stepsLeft = Math.max(stepsLeft, state[i]);
      }

      if (stepsLeft === 0) {
        best = Math.min(best, sofar);
        return;
      }

      if (sofar + stepsLeft >= best) {
        return;
      }

      const pushedButton = (button: readonly number[]): number[] => {
        const toggle = [...state];
        for (const v of button) {
          toggle[v] -= 1;
        }
        return toggle;
      };

      // Is there a button we HAVE to press?
      for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state.length; j++) {
          if (state[i] > state[j]) {
            // Is this "special".
            const usefulButtons = buttons.filter(
              (b) => b.includes(i) && !b.includes(j),
            );
            if (usefulButtons.length === 0) {
              console.info("impossible imbalance");
              return;
            }
            if (usefulButtons.length === 1) {
              // We must press it!
              const pushed = pushedButton(usefulButtons[0]);
              solveFrom(pushed, sofar + 1, buttons);
              return;
            }
          }
        }
      }

      for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
        const button = buttons[buttonIndex];
        const toggled = [...state];
        for (const v of button) {
          toggled[v] -= 1;
        }
        const otherButtons = buttons.slice(buttonIndex);
        solveFrom(toggled, sofar + 1, otherButtons);
      }
    };

    solveFrom(overallTarget, 0, buttons);

    return best;
  }
}

function parse(input: string): Machine[] {
  const lines = input.split("\n");

  const machines: Machine[] = [];

  for (const line of lines) {
    const parts = line.split(" ");

    let requiredLights = 0;
    const lightsString = parts[0].substring(1, parts[0].length - 1);

    for (let i = 0; i < lightsString.length; ++i) {
      if (lightsString[i] === "#") {
        requiredLights |= 1 << i;
      }
    }

    const lightButtons: number[] = [];
    const joltageButtons: number[][] = [];
    const requiredJoltages: number[] = [];

    for (let i = 1; i < parts.length; ++i) {
      const part = parts[i];

      if (part.startsWith("{") && part.endsWith("}")) {
        part
          .substring(1, part.length - 1)
          .split(",")
          .map(Number)
          .forEach((n) => requiredJoltages.push(n));
      }

      if (part.startsWith("(") && part.endsWith(")")) {
        let lightButton = 0;
        const joltageButton: number[] = [];
        part
          .substring(1, part.length - 1)
          .split(",")
          .map(Number)
          .forEach((idx) => {
            lightButton |= 1 << idx;
            joltageButton.push(idx);
          });

        lightButtons.push(lightButton);
        joltageButtons.push(joltageButton);
      }
    }

    machines.push(
      new Machine(
        requiredLights,
        lightButtons,
        joltageButtons,
        requiredJoltages,
      ),
    );
  }

  return machines;
}

function countMinLightButtonPresses(machines: Machine[]) {
  return machines.reduce(
    (prev, curr) => prev + curr.minLightButtonPresses(),
    0,
  );
}

function countMinJoltageButtonPresses(machines: Machine[]) {
  return machines.reduce(
    (prev, curr) => prev + curr.minJoltageButtonPresses(),
    0,
  );
}

console.log("part 1", countMinLightButtonPresses(parse(input)));
console.log("part 2", countMinJoltageButtonPresses(parse(input)));
