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
        name: "List",
        color: COLORS.GREEN,
      },
      {
        name: "Search",
        color: COLORS.BLUE,
      },
      {
        name: "Main",
        color: COLORS.PURPLE,
      },
    ],
  },
  {
    name: "List",
    options: [
      {
        name: "Main",
        color: COLORS.PURPLE,
      },
    ],
  },
  {
    name: "Search",
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
        name: "Inbox",
        color: COLORS.RED,
      },
      {
        name: "New",
        color: COLORS.YELLOW,
      },
      {
        name: "Main",
        color: COLORS.PURPLE,
      },
    ],
  },
  {
    name: "Inbox",
    options: [
      {
        name: "Main",
        color: COLORS.PURPLE,
      },
    ],
  },
  {
    name: "New",
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
