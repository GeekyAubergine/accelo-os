export const FRICTION = 0.1;

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
    return `#${(this.r * 255).toString(16)}${(this.g * 255).toString(16)}${(
      this.b * 255
    ).toString(16)}`;
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

export const BLOCK_TYPES = {
  WALL: 0,
  AIR: 1,
  SPLITTER: 2,
};

export class Map {
  private readonly width: number;
  private readonly height: number;
  private blocks: number[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.blocks = new Array(width * height).fill(BLOCK_TYPES.WALL);
  }

  getBlock(x: number, y: number): number {
    return this.blocks[y * this.width + x];
  }

  setBlock(x: number, y: number, block: number): void {
    this.blocks[y * this.width + x] = block;
  }
}

export class GameBlob {
  private pos: Vec2;
  private vel: Vec2;
  private radius: number;
  private color: Color;

  constructor(pos: Vec2, radius: number, color: Color) {
    this.pos = pos;
    this.vel = new Vec2(0, 0);
    this.radius = radius;
    this.color = color;
  }

  applyForce(force: Vec2): void {
    this.vel = this.vel.add(force);
  }

  update(dt: number): void {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.vel = this.vel.scale(1 - FRICTION);
  }

  static default(): GameBlob {
    return new GameBlob(new Vec2(0, 0), 10, new Color(1, 1, 1));
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
}

export class Game {
  private map: Map;
  private blobs: GameBlob[];
  private gravity: Vec2 = new Vec2(0, 0);

  constructor() {
    this.map = new Map(16, 16);
    this.blobs = [GameBlob.default()];
  }

  update(dt: number): void {
    for (const blob of this.blobs) {
      blob.applyForce(this.gravity);
      blob.update(dt);
    }
  }

  resetBlobs(): void {
    this.blobs = [GameBlob.default()];
  }

  setGravity(gravity: Vec2): void {
    this.gravity = gravity;
  }

  getBlobs(): GameBlob[] {
    return this.blobs;
  }
}
