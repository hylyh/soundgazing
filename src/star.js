'use strict';

class Star {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  draw(graphics) {
    // Draw a really dim halo around the star
    graphics.beginFill(0xffffff, 0.05);
    graphics.drawCircle(this.x, this.y, (this.size + 0.5) * 3);
    graphics.endFill();

    // Draw the star itself
    graphics.beginFill(0xffffff, 0.9);
    graphics.drawCircle(this.x, this.y, (this.size + 0.5) * 0.7);
    graphics.endFill();
  }
}

export { Star };
