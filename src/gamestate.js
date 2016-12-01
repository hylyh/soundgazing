'use strict';

import * as Phaser from 'phaser';

import { Star } from 'star';

class GameState extends Phaser.State {
  preload() {

  }

  create() {
    this.graphics = this.game.add.graphics(0, 0);
    this.stars = [];
    this.genStars(100);
  }

  update() {

  }

  render() {
    this.graphics.clear();
    for (const star of this.stars) {
      star.draw(this.graphics);
    }
  }

  genStars(num) {
    this.stars = [];
    for (let i = 0; i < num; i++) {
      this.stars.push(new Star(Math.random() * this.game.width,
                          Math.random() * this.game.height,
                          Math.round(Math.random() * 7)));
    }
  }
}

export { GameState };
