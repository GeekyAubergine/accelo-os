import { exhaust } from "./core";

export const FRICTION = 0.01;
export const WALL_FRICTION = 0.05;
export const BLOCK_SIZE = 24;

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
};

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
  COLOR_CHANGE_BLUE: 4,
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

    map.setBlock(8, 8, BlockType.AIR);
    map.setBlock(9, 8, BlockType.AIR);
    map.setBlock(10, 8, BlockType.AIR);
    map.setBlock(11, 8, BlockType.AIR);

    map.setBlock(12, 8, BlockType.COLOR_CHANGE_BLUE);

    return map;
  }

  getBlock(x: number, y: number): BlockType {
    return this.blocks[y * this.width + x];
  }

  getBlockAt(pos: Vec2): BlockType {
    const x = Math.floor(pos.x / BLOCK_SIZE);
    const y = Math.floor(pos.y / BLOCK_SIZE);

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

  constructor(pos: Vec2, radius: number, color: Color) {
    this.pos = pos;
    this.vel = new Vec2(0, 0);
    this.radius = radius;
    this.color = color;
  }

  applyForce(force: Vec2): void {
    this.vel = this.vel.add(force);
  }

  update(map: Map, dt: number): void {
    if (
      this.pos.x < -this.radius * 2 ||
      this.pos.x > map.getWidth() * BLOCK_SIZE + this.radius * 2 ||
      this.pos.y < -this.radius * 2 ||
      this.pos.y > map.getHeight() * BLOCK_SIZE + this.radius * 2
    ) {
      this.state = "dead";
      return;
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
      case BlockType.COLOR_CHANGE_BLUE:
        this.color = COLORS.BLUE;
        break;
      default:
        exhaust(block);
    }

    if (block === BlockType.VOID || block === BlockType.WALL) {
      this.state = "dead";
      return;
    }

    console.log(block);

    const nextPos = this.pos.add(this.vel.scale(dt));

    const topBlock = map.getBlockAt(
      new Vec2(nextPos.x, nextPos.y - this.radius)
    );

    if (topBlock === BlockType.WALL) {
      this.vel = new Vec2(this.vel.x * (1 - WALL_FRICTION), 0);
    }

    const bottomBlock = map.getBlockAt(
      new Vec2(nextPos.x, nextPos.y + this.radius)
    );

    if (bottomBlock === BlockType.WALL) {
      this.vel = new Vec2(this.vel.x * (1 - WALL_FRICTION), 0);
    }

    const leftBlock = map.getBlockAt(
      new Vec2(nextPos.x - this.radius, nextPos.y)
    );

    if (leftBlock === BlockType.WALL) {
      this.vel = new Vec2(0, this.vel.y * (1 - WALL_FRICTION));
    }

    const rightBlock = map.getBlockAt(
      new Vec2(nextPos.x + this.radius, nextPos.y)
    );

    if (rightBlock === BlockType.WALL) {
      this.vel = new Vec2(0, this.vel.y * (1 - WALL_FRICTION));
    }

    this.pos = this.pos.add(this.vel.scale(dt));

    this.vel = this.vel.scale(1 - FRICTION);
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

  update(dt: number): void {
    for (const blob of this.blobs) {
      blob.applyForce(this.gravity);
      blob.update(this.map, dt);
    }

    this.blobs = this.blobs.filter((blob) => blob.getState() === "alive");

    if (this.blobs.length === 0) {
      this.resetBlobs();
    }
  }

  resetBlobs(): void {
    this.blobs = [GameBlob.default(this.map)];
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
