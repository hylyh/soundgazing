'use strict';

import * as Phaser from 'phaser';

class GameState extends Phaser.State {
  preload() {

  }

  create() {
    this.graphics = this.game.add.graphics(0, 0);
  }

  update() {

  }

  render() {
    this.graphics.clear();
    this.graphics.beginFill(0xffffff);
    this.graphics.drawCircle(50, 50, 100);
    this.graphics.endFill();
  }
}

export { GameState };
