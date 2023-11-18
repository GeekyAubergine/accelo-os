export class Input {
  private keysDown: Set<string>;

  constructor() {
    this.keysDown = new Set();
  }

  init() {
    document.addEventListener("keydown", (e) => {
      this.onKeyDown(e.key);
    });

    document.addEventListener("keyup", (e) => {
      this.onKeyUp(e.key);
    });
  }

  isKeyDown(key: string): boolean {
    return this.keysDown.has(key);
  }

  onKeyDown(key: string) {
    this.keysDown.add(key);
  }

  onKeyUp(key: string) {
    this.keysDown.delete(key);
  }
}
