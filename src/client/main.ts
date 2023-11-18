import { Game, Vec2 } from "./game";
import { Input } from "./input";
import { Renderer } from "./renderer";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");

let renderer: Renderer | null = null;
let game: Game | null = null;
let input: Input | null = null;

function onWindowResize() {
  if (!canvas) {
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

async function initializeRenderer(): Promise<Renderer> {
  if (!canvas) {
    throw new Error("No canvas");
  }

  const renderer = new Renderer(canvas);

  return renderer;
}

async function initialize(): Promise<void> {
  renderer = await initializeRenderer();

  game = new Game();
  game.setGravity(new Vec2(0, 2));

  input = new Input();

  input.init();

  // const g = new Game(renderer);

  // g.world.addEntity(
  //   new EnemyWardrobe(
  //     "wardobe-1",
  //     new Vector(4 * TILE_SIZE, 0),
  //     0,
  //     new Vector(-32, 0),
  //     0
  //   )
  // );

  // await g.init(Date.now() / 1000);

  // game = g;
}

let lastTick = 0;
function tick() {
  if (lastTick === 0) {
    lastTick = Date.now() / 1000;
  }

  const now = Date.now() / 1000;

  const dt = now - lastTick;

  // if (!game) {
  //   window.requestAnimationFrame(tick);
  //   return;
  // }

  if (!renderer || !game || !input) {
    window.requestAnimationFrame(tick);
    return;
  }

  let forceX = 0;
  let forceY = 0;

  if (input.isKeyDown("ArrowLeft")) {
    forceX -= 10;
  }

  if (input.isKeyDown("ArrowRight")) {
    forceX += 10;
  }

  if (input.isKeyDown("ArrowUp")) {
    forceY -= 10;
  }

  if (input.isKeyDown("ArrowDown")) {
    forceY += 10;
  }

  game.setGravity(new Vec2(forceX, forceY));

  game.update(dt);

  renderer.render(game);

  lastTick = Date.now() / 1000;

  window.requestAnimationFrame(tick);
}

window.addEventListener("resize", onWindowResize);
window.requestAnimationFrame(tick);

onWindowResize();

initialize();
