import { exhaust } from "./core";

export const FRICTION = 0.01;
export const WALL_FRICTION = 0.05;
export const BLOCK_SIZE = 24;
export const SUBSTEPS = 1;

export type GameEventColorCollected = {
  type: "color-collected";
  color: Color;
};

export type GameEvent = GameEventColorCollected;

export class Color {
  private readonly r: number;
  private readonly g: number;
  private readonly b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  asHex(): string {
    const r = Math.floor(this.r * 255);
    const g = Math.floor(this.g * 255);
    const b = Math.floor(this.b * 255);

    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  }

  combine(other: Color): Color {
    return new Color(
      (this.r + other.r) / 2,
      (this.g + other.g) / 2,
      (this.b + other.b) / 2
    );
  }

  distance(other: Color): number {
    return (
      Math.abs(this.r - other.r) +
      Math.abs(this.g - other.g) +
      Math.abs(this.b - other.b)
    );
  }
}

export const COLORS = {
  WHITE: new Color(1, 1, 1),
  RED: new Color(1, 0.2, 0.2),
  BLUE: new Color(0.3, 0.3, 0.9),
  PURPLE: new Color(0.7, 0.3, 0.7),
  GREEN: new Color(0.3, 0.7, 0.3),
  YELLOW: new Color(0.9, 0.9, 0.3),
  ORANGE: new Color(0.9, 0.6, 0.2),
} as const;

export class Vec2 {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  sub(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  mul(other: Vec2): Vec2 {
    return new Vec2(this.x * other.x, this.y * other.y);
  }

  div(other: Vec2): Vec2 {
    return new Vec2(this.x / other.x, this.y / other.y);
  }

  scale(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vec2 {
    return this.scale(1 / this.length());
  }
}

export const BlockType = {
  VOID: 0,
  WALL: 1,
  AIR: 2,
  SPLITTER: 3,
  GOAL_RED: 4,
  GOAL_BLUE: 5,
  GOAL_YELLOW: 6,
  GOAL_PURPLE: 7,
  GOAL_ORANGE: 8,
  GOAL_GREEN: 9,
  COLOR_CHANGE_BLUE: 10,
  COLOR_CHANGE_RED: 11,
  COLOR_CHANGE_YELLOW: 12,
} as const;
export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export class Map {
  private readonly width: number;
  private readonly height: number;
  private blocks: BlockType[];

  private xOffset: number = 0;
  private yOffset: number = 0;

  constructor(width: number, height: number) {
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
    this.blocks = new Array(this.width * this.height).fill(BlockType.WALL);

    this.xOffset = -(this.width * BLOCK_SIZE) / 2;
    this.yOffset = -(this.height * BLOCK_SIZE) / 2;
  }

  static default(): Map {
    const map = new Map(17, 17);

    map.setBlock(0, 0, BlockType.AIR);
    map.setBlock(1, 0, BlockType.AIR);
    map.setBlock(2, 0, BlockType.AIR);
    map.setBlock(12, 0, BlockType.AIR);
    map.setBlock(13, 0, BlockType.GOAL_ORANGE);
    map.setBlock(14, 0, BlockType.AIR);

    map.setBlock(0, 1, BlockType.AIR);
    map.setBlock(1, 1, BlockType.AIR);
    map.setBlock(2, 1, BlockType.AIR);
    map.setBlock(12, 1, BlockType.AIR);
    map.setBlock(13, 1, BlockType.AIR);
    map.setBlock(14, 1, BlockType.AIR);

    map.setBlock(0, 2, BlockType.GOAL_PURPLE);
    map.setBlock(2, 2, BlockType.AIR);
    map.setBlock(12, 2, BlockType.AIR);
    map.setBlock(13, 2, BlockType.AIR);
    map.setBlock(14, 2, BlockType.AIR);
    map.setBlock(15, 2, BlockType.AIR);

    map.setBlock(2, 3, BlockType.AIR);
    map.setBlock(5, 3, BlockType.GOAL_RED);
    map.setBlock(15, 3, BlockType.AIR);

    map.setBlock(2, 4, BlockType.AIR);
    map.setBlock(6, 4, BlockType.AIR);
    map.setBlock(5, 4, BlockType.AIR);
    map.setBlock(15, 4, BlockType.AIR);

    map.setBlock(0, 5, BlockType.AIR);
    map.setBlock(1, 5, BlockType.AIR);
    map.setBlock(2, 5, BlockType.AIR);
    map.setBlock(5, 5, BlockType.COLOR_CHANGE_YELLOW);
    map.setBlock(6, 5, BlockType.AIR);
    map.setBlock(15, 5, BlockType.AIR);

    map.setBlock(2, 6, BlockType.AIR);
    map.setBlock(6, 6, BlockType.AIR);
    map.setBlock(10, 6, BlockType.AIR);
    map.setBlock(11, 6, BlockType.AIR);
    map.setBlock(12, 6, BlockType.AIR);
    map.setBlock(13, 6, BlockType.AIR);
    map.setBlock(14, 6, BlockType.AIR);
    map.setBlock(15, 6, BlockType.AIR);

    map.setBlock(2, 7, BlockType.AIR);
    map.setBlock(6, 7, BlockType.AIR);
    map.setBlock(10, 7, BlockType.AIR);
    map.setBlock(15, 7, BlockType.GOAL_YELLOW);

    map.setBlock(2, 8, BlockType.AIR);
    map.setBlock(6, 8, BlockType.AIR);
    map.setBlock(8, 8, BlockType.AIR);
    map.setBlock(9, 8, BlockType.AIR);
    map.setBlock(10, 8, BlockType.AIR);
    map.setBlock(11, 8, BlockType.AIR);
    map.setBlock(12, 8, BlockType.COLOR_CHANGE_BLUE);

    map.setBlock(2, 9, BlockType.AIR);
    map.setBlock(7, 9, BlockType.AIR);
    map.setBlock(6, 9, BlockType.AIR);
    map.setBlock(8, 9, BlockType.AIR);
    map.setBlock(9, 9, BlockType.AIR);

    map.setBlock(2, 10, BlockType.AIR);
    map.setBlock(6, 10, BlockType.AIR);
    map.setBlock(7, 10, BlockType.AIR);
    map.setBlock(8, 10, BlockType.AIR);
    map.setBlock(9, 10, BlockType.AIR);
    map.setBlock(10, 10, BlockType.AIR);

    map.setBlock(0, 11, BlockType.AIR);
    map.setBlock(1, 11, BlockType.AIR);
    map.setBlock(2, 11, BlockType.AIR);
    map.setBlock(3, 11, BlockType.AIR);
    map.setBlock(4, 11, BlockType.AIR);
    map.setBlock(5, 11, BlockType.AIR);
    map.setBlock(6, 11, BlockType.AIR);
    map.setBlock(7, 11, BlockType.AIR);
    // map.setBlock(8, 11, BlockType.SPLITTER);
    map.setBlock(8, 11, BlockType.AIR);
    map.setBlock(9, 11, BlockType.AIR);
    map.setBlock(10, 11, BlockType.AIR);
    map.setBlock(11, 11, BlockType.AIR);
    map.setBlock(12, 11, BlockType.AIR);
    map.setBlock(13, 11, BlockType.AIR);
    map.setBlock(14, 11, BlockType.AIR);
    map.setBlock(15, 11, BlockType.AIR);
    map.setBlock(16, 11, BlockType.AIR);

    map.setBlock(2, 12, BlockType.AIR);
    map.setBlock(6, 12, BlockType.AIR);
    map.setBlock(7, 12, BlockType.AIR);
    map.setBlock(8, 12, BlockType.AIR);
    map.setBlock(9, 12, BlockType.AIR);
    map.setBlock(10, 12, BlockType.AIR);
    map.setBlock(13, 12, BlockType.AIR);
    map.setBlock(14, 12, BlockType.AIR);

    map.setBlock(2, 13, BlockType.AIR);
    map.setBlock(13, 13, BlockType.AIR);
    map.setBlock(14, 13, BlockType.AIR);

    map.setBlock(2, 14, BlockType.AIR);
    map.setBlock(12, 14, BlockType.GOAL_GREEN);
    map.setBlock(13, 14, BlockType.AIR);
    map.setBlock(14, 14, BlockType.AIR);

    map.setBlock(0, 15, BlockType.AIR);
    map.setBlock(1, 15, BlockType.AIR);
    map.setBlock(2, 15, BlockType.AIR);
    map.setBlock(12, 15, BlockType.AIR);
    map.setBlock(13, 15, BlockType.COLOR_CHANGE_RED);
    map.setBlock(14, 15, BlockType.AIR);

    map.setBlock(0, 16, BlockType.GOAL_BLUE);
    map.setBlock(1, 16, BlockType.AIR);
    map.setBlock(2, 16, BlockType.AIR);
    map.setBlock(12, 16, BlockType.AIR);
    map.setBlock(13, 16, BlockType.AIR);
    map.setBlock(14, 16, BlockType.AIR);

    return map;
  }

  getBlock(x: number, y: number): BlockType {
    return this.blocks[y * this.width + x] ?? BlockType.VOID;
  }

  getBlockAt(pos: Vec2): BlockType {
    const x = Math.floor(pos.x / BLOCK_SIZE);
    const y = Math.floor(pos.y / BLOCK_SIZE);

    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return BlockType.VOID;
    }

    return this.getBlock(x, y) ?? BlockType.VOID;
  }

  getBlockPos(x: number, y: number): Vec2 {
    return new Vec2(x * BLOCK_SIZE, y * BLOCK_SIZE);
  }

  setBlock(x: number, y: number, block: BlockType): void {
    this.blocks[y * this.width + x] = block;
  }

  getXOffset(): number {
    return this.xOffset;
  }

  getYOffset(): number {
    return this.yOffset;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

type BlobState = "alive" | "dead";
export class GameBlob {
  private pos: Vec2;
  private vel: Vec2;
  private radius: number;
  private color: Color;
  private state: BlobState = "alive";

  private lastSplit: number = Date.now();

  constructor(pos: Vec2, radius: number, color: Color) {
    this.pos = pos;
    this.vel = new Vec2(0, 0);
    this.radius = radius;
    this.color = color;
  }

  applyForce(force: Vec2): void {
    this.vel = this.vel.add(force);
  }

  update(map: Map, dt: number, game: Game): GameEvent[] {
    const events: GameEvent[] = [];

    const now = Date.now();
    const secondsSinceLastSplit = (now - this.lastSplit) / 1000;

    for (let i = 0; i < SUBSTEPS; i++) {
      if (
        this.pos.x < -this.radius * 2 ||
        this.pos.x > map.getWidth() * BLOCK_SIZE + this.radius * 2 ||
        this.pos.y < -this.radius * 2 ||
        this.pos.y > map.getHeight() * BLOCK_SIZE + this.radius * 2
      ) {
        this.state = "dead";
        return events;
      }

      const block = map.getBlockAt(this.pos);

      switch (block) {
        case BlockType.VOID:
        case BlockType.WALL:
          this.state = "dead";
          break;
        case BlockType.AIR:
          break;
        case BlockType.SPLITTER:
          break;
        case BlockType.GOAL_BLUE:
          if (this.color === COLORS.BLUE) {
            this.state = "dead";
            events.push({
              type: "color-collected",
              color: this.color,
            });
          }
          break;
        case BlockType.GOAL_RED:
          if (this.color === COLORS.RED) {
            this.state = "dead";
            events.push({
              type: "color-collected",
              color: this.color,
            });
          }
          break;
        case BlockType.GOAL_YELLOW:
          if (this.color === COLORS.YELLOW) {
            this.state = "dead";
            events.push({
              type: "color-collected",
              color: this.color,
            });
          }
          break;
        case BlockType.GOAL_PURPLE:
          if (this.color === COLORS.PURPLE) {
            this.state = "dead";
            events.push({
              type: "color-collected",
              color: this.color,
            });
          }
          break;
        case BlockType.GOAL_ORANGE:
          if (this.color === COLORS.ORANGE) {
            this.state = "dead";
            events.push({
              type: "color-collected",
              color: this.color,
            });
          }
          break;
        case BlockType.GOAL_GREEN:
          if (this.color === COLORS.GREEN) {
            this.state = "dead";
            events.push({
              type: "color-collected",
              color: this.color,
            });
          }
          break;
        case BlockType.COLOR_CHANGE_BLUE:
          switch (this.color) {
            case COLORS.WHITE:
              this.color = COLORS.BLUE;
              break;
            case COLORS.RED:
              this.color = COLORS.PURPLE;
              break;
            case COLORS.YELLOW:
              this.color = COLORS.GREEN;
              break;
            case COLORS.BLUE:
            case COLORS.PURPLE:
            case COLORS.GREEN:
            case COLORS.ORANGE:
              break;
          }
          break;
        case BlockType.COLOR_CHANGE_RED:
          switch (this.color) {
            case COLORS.WHITE:
              this.color = COLORS.RED;
              break;
              break;
            case COLORS.YELLOW:
              this.color = COLORS.ORANGE;
              break;
            case COLORS.BLUE:
              this.color = COLORS.PURPLE;
              break;
            case COLORS.RED:
            case COLORS.PURPLE:
            case COLORS.GREEN:
            case COLORS.ORANGE:
              break;
          }
          break;
        case BlockType.COLOR_CHANGE_YELLOW:
          switch (this.color) {
            case COLORS.WHITE:
              this.color = COLORS.YELLOW;
              break;
            case COLORS.BLUE:
              this.color = COLORS.GREEN;
              break;
            case COLORS.RED:
              this.color = COLORS.ORANGE;
              break;
            case COLORS.YELLOW:
            case COLORS.PURPLE:
            case COLORS.GREEN:
            case COLORS.ORANGE:
              break;
          }
          break;
        default:
          exhaust(block);
      }

      if (block === BlockType.VOID || block === BlockType.WALL) {
        this.state = "dead";
        return events;
      }

      const nextPos = this.pos.add(this.vel.scale(dt / SUBSTEPS));

      const top = map.getBlockAt(nextPos.add(new Vec2(0, -this.radius + 1)));

      if (top === BlockType.WALL) {
        this.vel = new Vec2(this.vel.x, Math.max(0, this.vel.y));
      }

      const bottom = map.getBlockAt(nextPos.add(new Vec2(0, this.radius - 1)));

      if (bottom === BlockType.WALL) {
        this.vel = new Vec2(this.vel.x, Math.min(0, this.vel.y));
      }

      const left = map.getBlockAt(nextPos.add(new Vec2(-this.radius + 1, 0)));

      if (left === BlockType.WALL) {
        this.vel = new Vec2(Math.max(0, this.vel.x), this.vel.y);
      }

      const right = map.getBlockAt(nextPos.add(new Vec2(this.radius - 1, 0)));

      if (right === BlockType.WALL) {
        this.vel = new Vec2(Math.min(0, this.vel.x), this.vel.y);
      }

      this.pos = this.pos.add(this.vel.scale(dt / SUBSTEPS));

      this.vel = this.vel.scale(1 - FRICTION);
    }

    return events;
  }

  static default(map: Map): GameBlob {
    return new GameBlob(
      new Vec2(
        (map.getWidth() * BLOCK_SIZE) / 2,
        (map.getHeight() * BLOCK_SIZE) / 2
      ),
      BLOCK_SIZE * 0.4,
      COLORS.WHITE
    );
  }

  getPos(): Vec2 {
    return this.pos;
  }

  getRadius(): number {
    return this.radius;
  }

  getColor(): Color {
    return this.color;
  }

  getState(): BlobState {
    return this.state;
  }
}

export class Game {
  private map: Map;
  private blobs: GameBlob[];
  private gravity: Vec2 = new Vec2(0, 0);

  constructor() {
    this.map = Map.default();
    this.blobs = [GameBlob.default(this.map)];
  }

  update(dt: number): GameEvent[] {
    const events: GameEvent[] = [];
    for (const blob of this.blobs) {
      blob.applyForce(this.gravity);
      const e = blob.update(this.map, dt, this);

      events.push(...e);
    }

    this.blobs = this.blobs.filter((blob) => blob.getState() === "alive");

    if (this.blobs.length === 0) {
      this.resetBlobs();
    }

    return events;
  }

  resetBlobs(): void {
    this.blobs = [GameBlob.default(this.map)];
  }

  addBlob(blob: GameBlob): void {
    this.blobs.push(blob);
  }

  setGravity(gravity: Vec2): void {
    this.gravity = gravity;
  }

  getBlobs(): GameBlob[] {
    return this.blobs;
  }

  getMap(): Map {
    return this.map;
  }
}
