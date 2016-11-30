'use strict';

class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  draw(graphics) {
    graphics.beginFill(0xffffff);
    graphics.drawCircle(this.x, this.y, (this.size + 1) * 3);
    graphics.endFill();
  }
}

export { Star };
