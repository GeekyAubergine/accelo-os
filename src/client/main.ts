import { Game, Vec2 } from "./game";
import { Input } from "./input";
import { OS } from "./os";
import { Renderer } from "./renderer";
import "./style.css";

const socket = new WebSocket("ws://172.20.10.3:3000");
let socketOpen = false;
let keyboardMode = true;

window.addEventListener("keydown", (e) => {
  if (e.key === "i") {
    keyboardMode = !keyboardMode;
  }
});

const GYRO_MULT = 0.2;

let gyro: { x: number; y: number; z: number } = {
  x: 0,
  y: 0,
  z: 0,
};

// Connection opened
socket.addEventListener("open", (event) => {
  // alert("Connected to server");
  socket.send("Hello Server!");
  socketOpen = true;
});

// Listen for messages
socket.addEventListener("message", (event) => {
  const d = JSON.parse(event.data);
  if (d.type === "gyro") {
    gyro = {
      x: d.x * GYRO_MULT,
      y: d.y * GYRO_MULT,
      z: d.z * GYRO_MULT,
    };
  }
});

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");

let renderer: Renderer | null = null;
let game: Game | null = null;
let input: Input | null = null;
let os: OS | null = null;

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

  os = new OS();

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

  if (!renderer || !game || !input || !os) {
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

  if (keyboardMode) {
    game.setGravity(new Vec2(forceX, forceY));
  } else {
    game.setGravity(new Vec2(gyro.y, gyro.x));
  }

  // if (socketOpen) {
  //   socket.send(JSON.stringify({ forceX, forceY }));
  // }

  const events = game.update(dt);

  events.forEach((event) => {
    os?.onEvent(event);
  });

  renderer.render(game, os);

  lastTick = Date.now() / 1000;

  window.requestAnimationFrame(tick);
}

window.addEventListener("resize", onWindowResize);
window.requestAnimationFrame(tick);

onWindowResize();

initialize();
