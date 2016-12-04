'use strict';

class Star {
  constructor(game, id, x, y, size) {
    this.game = game;
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;

    this.hovered = false;
  }

  draw(graphics) {
    const pixPos = this.getPixelPos();

    // If we're being hovered draw a circle around the star
    if (this.hovered) {
      graphics.lineStyle(1, 0xffffff, 1);
      graphics.drawCircle(pixPos.x - 1, pixPos.y - 1, 20);
      graphics.lineStyle();
    }

    // Draw a really dim halo around the star
    graphics.beginFill(0xffffff, 0.05);
    graphics.drawCircle(pixPos.x, pixPos.y, (this.size + 0.5) * 3);
    graphics.endFill();

    // Draw the star itself
    graphics.beginFill(0xffffff, 0.9);
    graphics.drawCircle(pixPos.x, pixPos.y, (this.size + 0.5) * 0.9);
    graphics.endFill();
  }

  getPixelPos() {
    return {
      x: this.game.width / 2 + this.x * (this.game.width / 2),
      y: this.game.height / 2 + this.y * (this.game.height / 2),
    };
  }
}

export { Star };
