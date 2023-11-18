import { Block } from "typescript";
import { GameBlob as GameBlob, Game, Map, BlockType, BLOCK_SIZE } from "./game";
import { exhaust } from "./core";

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  render(game: Game) {
    const { ctx } = this;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderGame(game);
  }

  renderGame(game: Game) {
    const { ctx } = this;

    ctx.fillStyle = "#888888";

    ctx.fillRect(
      this.canvas.width / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height
    );

    ctx.save();

    ctx.translate(this.canvas.width * 0.75, this.canvas.height / 2);

    const map = game.getMap();

    ctx.translate(map.getXOffset(), map.getYOffset());

    this.renderMap(game.getMap());

    game.getBlobs().forEach((blob) => this.renderBlob(blob));

    ctx.restore();
  }

  renderMap(map: Map) {
    const { ctx } = this;

    ctx.save();

    for (let y = 0; y < map.getHeight(); y++) {
      for (let x = 0; x < map.getWidth(); x++) {
        const block = map.getBlock(x, y);
        ctx.save();

        ctx.translate(x * BLOCK_SIZE, y * BLOCK_SIZE);

        this.renderBlock(block);

        ctx.restore();
      }
    }

    ctx.restore();
  }

  renderBlock(blockType: BlockType) {
    const { ctx } = this;

    switch (blockType) {
      case BlockType.VOID:
        ctx.fillRect(0, 0, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        break;
      case BlockType.AIR:
        ctx.fillStyle = "#aaaaaa";
        ctx.fillRect(0, 0, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        break;
      case BlockType.WALL:
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        break;
      case BlockType.SPLITTER:
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        break;
      default:
        exhaust(blockType);
    }
  }

  renderBlob(blob: GameBlob) {
    const { ctx } = this;

    const pos = blob.getPos();
    const radius = blob.getRadius();
    const color = blob.getColor().asHex();

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}
