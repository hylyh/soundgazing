'use strict';

import * as Perlin from 'pf-perlin';

class Star {
  constructor(game, id, x, y, size) {
    this.game = game;
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
    this.alpha = 1;

    this.hovered = false;

    this.rippling = false;
    this.rippleFilled = false;
    this.rippleRad = 0;
    this.maxRipple = 0;
    this.rippleSpeed = 0;

    this.startTime = new Date().getTime();

    this.perlin = Perlin.default({ dimensions: 1, min: 0.4 });
  }

  update() {
    this.alpha = this.perlin.get((new Date().getTime() - this.startTime) / 200);

    if (this.rippling) {
      this.rippleRad += this.rippleSpeed;

      if (this.rippleRad > this.maxRipple) {
        this.rippling = false;
      }
    }
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
    graphics.beginFill(0xffffff, this.alpha);
    graphics.drawCircle(pixPos.x, pixPos.y, (this.size + 4) * 0.5);
    graphics.endFill();

    if (this.rippling) {
      if (this.rippleFilled) {
        graphics.beginFill(0xffffff, (this.maxRipple - this.rippleRad) / this.maxRipple);
        graphics.drawCircle(pixPos.x, pixPos.y, this.rippleRad);
        graphics.endFill();
      } else {
        graphics.lineStyle(1, 0xffffff, (this.maxRipple - this.rippleRad) / this.maxRipple);
        graphics.drawCircle(pixPos.x - 0.5, pixPos.y - 0.5, this.rippleRad);
        graphics.lineStyle();
      }
    }
  }

  getPixelPos() {
    return {
      x: this.game.width / 2 + this.x * (this.game.width / 2),
      y: this.game.height / 2 + this.y * (this.game.height / 2),
    };
  }

  playSound(loud, originIds) {
    this.rippling = true;
    if (loud) {
      this.game.state.getCurrentState().starSounds.loud[this.size].play();
      this.rippleRad = 5;
      this.maxRipple = 50;
      this.rippleSpeed = 0.25;
      this.rippleFilled = false;
    } else {
      this.game.state.getCurrentState().starSounds.soft[this.size].play();
      this.rippleRad = 0;
      this.maxRipple = 15;
      this.rippleSpeed = 0.5;
      this.rippleFilled = true;
    }

    if (loud && originIds !== 'noprop') {
      const delay = 500;
      const ids = originIds || [];
      ids.push(this.id);
      setTimeout(() => {
        for (const con of this.game.state.getCurrentState().connections) {
          if (con[0] === this.id) {
            if (ids.indexOf(con[1]) !== -1) continue;
            this.game.state.getCurrentState().stars[con[1]].playSound(true, ids);
          }
          if (con[1] === this.id) {
            if (ids.indexOf(con[0]) !== -1) continue;
            this.game.state.getCurrentState().stars[con[0]].playSound(true, ids);
          }
        }
      }, delay);
    }
  }
}

export { Star };
