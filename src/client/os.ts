import { exhaust } from "./core";
import { COLORS, Color, GameEvent } from "./game";

export type OsState = {
  name: string;
  options: {
    name: string;
    color: Color;
  }[];
};

const states: OsState[] = [
  {
    name: "Main",
    options: [
      {
        name: "Files",
        color: COLORS.ORANGE,
      },
      {
        name: "Email",
        color: COLORS.RED,
      },
    ],
  },
  {
    name: "Files",
    options: [
      {
        name: "Main",
        color: COLORS.PURPLE,
      },
    ],
  },
  {
    name: "Email",
    options: [
      {
        name: "Main",
        color: COLORS.PURPLE,
      },
    ],
  },
];

export class OS {
  private state: OsState;

  constructor() {
    this.state = states[0];
  }

  onEvent(event: GameEvent) {
    const { type } = event;
    switch (type) {
      case "color-collected": {
        const { color } = event;

        const nextStateName = this.state.options.find(
          (option) => option.color === color
        )?.name;

        if (!nextStateName) {
          return;
        }

        const nextState = states.find((state) => state.name === nextStateName);

        if (!nextState) {
          throw new Error(`No state with name ${nextStateName}`);
        }

        this.state = nextState;

        break;
      }
      default:
        exhaust(type);
    }
  }

  getState(): OsState {
    return this.state;
  }
}
