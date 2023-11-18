import { GameBlob as GameBlob, Game } from "./game";

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

    // Set 0,0 to center of screen

    ctx.save();

    ctx.translate(this.canvas.width * 0.75, this.canvas.height / 2);

    game.getBlobs().forEach((blob) => this.renderBlob(blob));

    ctx.restore();
  }

  renderBlob(blob: GameBlob) {
    const { ctx } = this;

    const pos = blob.getPos();
    const radius = blob.getRadius();
    const color = blob.getColor().asHex();

    console.log({ pos, radius, color });

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}
