'use strict';

import * as Phaser from 'phaser';

import { Star } from 'star';

class GameState extends Phaser.State {
  preload() {

  }

  create() {
    this.graphics = this.game.add.graphics(0, 0);
    this.stars = {};
    this.connections = [];
    this.dragStartStar = null;
    this.pointerLastDown = false;
    this.pointerLastUp = false;

    this.genStars(100);
  }

  update() {
    // Find the selected star
    const pointer = this.game.input.activePointer;
    const maxDist = 10;
    let closestDist = -1;
    let closestStar = null;
    for (const star of this.stars) {
      star.hovered = false;

      // Get the distance from the star to the pointer
      const dist = Math.sqrt((pointer.x - star.x) * (pointer.x - star.x) +
                             (pointer.y - star.y) * (pointer.y - star.y));

      // Past the max threshold
      if (dist > maxDist) continue;

      // See if it's closer than the current closest star (if there is one)
      if (closestStar !== null) {
        if (dist < closestDist) {
          closestDist = dist;
          closestStar = star;
        }
      } else {
        closestDist = dist;
        closestStar = star;
      }
    }

    if (closestStar !== null) {
      closestStar.hovered = true;

      if (pointer.isDown && !this.pointerLastDown) {
        this.dragStartStar = closestStar;
      }
      if (pointer.isUp && !this.pointerLastUp) {
        if (this.dragStartStar !== null && closestStar !== this.dragStartStar) {
          // Dragged between two stars
          let exists = false;
          let existCon = null;
          for (const connection of this.connections) {
            // See if this connection already exists
            if ((connection[0] === this.dragStartStar.id && connection[1] === closestStar.id) ||
                (connection[1] === this.dragStartStar.id && connection[0] === closestStar.id)) {
              exists = true;
              existCon = connection;
              break;
            }
          }

          if (exists) {
            // This connection already exists, so remove it
            const index = this.connections.indexOf(existCon);
            this.connections.splice(index, 1);
          } else {
            // This connection is new
            this.connections.push([this.dragStartStar.id, closestStar.id]);
          }
          this.dragStartStar = null;
        } else {
          // Not dragging or ended at the same star
          this.dragStartStar = null;
        }
      }
    } else {
      if (pointer.isUp && !this.pointerLastUp) {
        // Mouse up with no star nearby, stop drag
        this.dragStartStar = null;
      }
    }

    this.pointerLastDown = pointer.isDown;
  }

  render() {
    this.graphics.clear();

    // Draw the stars
    for (const star of this.stars) {
      star.draw(this.graphics);
    }

    // Draw the connections between the stars
    for (const connection of this.connections) {
      const star0 = this.stars[connection[0]];
      const star1 = this.stars[connection[1]];

      this.graphics.lineStyle(1, 0xffffff, 1);
      this.graphics.moveTo(star0.x - 1, star0.y - 1);
      this.graphics.lineTo(star1.x - 1, star1.y - 1);
      this.graphics.endFill();
    }

    if (this.dragStartStar !== null) {
      this.graphics.lineStyle(1, 0xffffff, 1);
      this.graphics.moveTo(this.dragStartStar.x - 1, this.dragStartStar.y - 1);
      this.graphics.lineTo(this.game.input.activePointer.x - 1,
                           this.game.input.activePointer.y - 1);
      this.graphics.endFill();
    }
  }

  genStars(num) {
    this.stars = [];
    for (let i = 0; i < num; i++) {
      this.stars[i] = new Star(i, // id
                               Math.random() * this.game.width, // x
                               Math.random() * this.game.height, // y
                               Math.round(Math.random() * 7)); // size
    }
  }
}

export { GameState };
