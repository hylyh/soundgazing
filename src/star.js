'use strict';

class Star {
  constructor(id, x, y, size) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;

    this.hovered = false;
  }

  draw(graphics) {
    // If we're being hovered draw a circle around the star
    if (this.hovered) {
      graphics.lineStyle(1, 0xffffff, 1);
      graphics.drawCircle(this.x - 1, this.y - 1, 20);
      graphics.lineStyle();
    }

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
