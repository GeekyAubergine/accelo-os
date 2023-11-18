import { Game, Vec2 } from "./game";
import { Renderer } from "./renderer";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");

let renderer: Renderer | null = null;
let game: Game | null = null;

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

  if (!renderer || !game) {
    window.requestAnimationFrame(tick);
    return;
  }

  game.update(dt);

  renderer.render(game);

  lastTick = Date.now() / 1000;

  window.requestAnimationFrame(tick);
}

window.addEventListener("resize", onWindowResize);
window.requestAnimationFrame(tick);

onWindowResize();

initialize();
