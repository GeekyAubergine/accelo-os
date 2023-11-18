import { Game, Vec2 } from "./game";
import { Input } from "./input";
import { Renderer } from "./renderer";
import "./style.css";

const socket = new WebSocket("ws://172.20.10.3:3000");
let socketOpen = false;

function handleMotionEvent(event) {
  const x = event.accelerationIncludingGravity.x;
  const y = event.accelerationIncludingGravity.y;
  const z = event.accelerationIncludingGravity.z;

  console.log(x, y, z);
  // Do something awesome.

  window.alert(`${x}, ${y}, ${z}`);
}

window.addEventListener("devicemotion", handleMotionEvent, true);

// Connection opened
socket.addEventListener("open", (event) => {
  // alert("Connected to server");
  socket.send("Hello Server!");
  socketOpen = true;
});

// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});

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

  // if (socketOpen) {
  //   socket.send(JSON.stringify({ forceX, forceY }));
  // }

  game.update(dt);

  renderer.render(game);

  lastTick = Date.now() / 1000;

  window.requestAnimationFrame(tick);
}

window.addEventListener("resize", onWindowResize);
window.requestAnimationFrame(tick);

onWindowResize();

initialize();
