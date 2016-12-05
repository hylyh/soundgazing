'use strict';

import * as Phaser from 'phaser';

import { Star } from 'star';

const API_URL = 'https://api-ssl.bitly.com/v3/shorten';
const API_KEY = '260122bb7522abfeda91edcd82e3defff3c5e1c7'; // ehhhh

class GameState extends Phaser.State {
  preload() {
    this.game.load.audio('star-loud-0', ['audio/SFX_StarNoise_Loud_07.ogg',
                                         'audio/SFX_StarNoise_Loud_07.mp3']);
    this.game.load.audio('star-loud-1', ['audio/SFX_StarNoise_Loud_06.ogg',
                                         'audio/SFX_StarNoise_Loud_06.mp3']);
    this.game.load.audio('star-loud-2', ['audio/SFX_StarNoise_Loud_05.ogg',
                                         'audio/SFX_StarNoise_Loud_05.mp3']);
    this.game.load.audio('star-loud-3', ['audio/SFX_StarNoise_Loud_04.ogg',
                                         'audio/SFX_StarNoise_Loud_04.mp3']);
    this.game.load.audio('star-loud-4', ['audio/SFX_StarNoise_Loud_03.ogg',
                                         'audio/SFX_StarNoise_Loud_03.mp3']);
    this.game.load.audio('star-loud-5', ['audio/SFX_StarNoise_Loud_02.ogg',
                                         'audio/SFX_StarNoise_Loud_02.mp3']);
    this.game.load.audio('star-loud-6', ['audio/SFX_StarNoise_Loud_01.ogg',
                                         'audio/SFX_StarNoise_Loud_01.mp3']);
    this.game.load.audio('star-soft-0', ['audio/SFX_StarNoise_Soft_07.ogg',
                                         'audio/SFX_StarNoise_Soft_07.mp3']);
    this.game.load.audio('star-soft-1', ['audio/SFX_StarNoise_Soft_06.ogg',
                                         'audio/SFX_StarNoise_Soft_06.mp3']);
    this.game.load.audio('star-soft-2', ['audio/SFX_StarNoise_Soft_05.ogg',
                                         'audio/SFX_StarNoise_Soft_05.mp3']);
    this.game.load.audio('star-soft-3', ['audio/SFX_StarNoise_Soft_04.ogg',
                                         'audio/SFX_StarNoise_Soft_04.mp3']);
    this.game.load.audio('star-soft-4', ['audio/SFX_StarNoise_Soft_03.ogg',
                                         'audio/SFX_StarNoise_Soft_03.mp3']);
    this.game.load.audio('star-soft-5', ['audio/SFX_StarNoise_Soft_02.ogg',
                                         'audio/SFX_StarNoise_Soft_02.mp3']);
    this.game.load.audio('star-soft-6', ['audio/SFX_StarNoise_Soft_01.ogg',
                                         'audio/SFX_StarNoise_Soft_01.mp3']);
    this.game.load.audio('bgm', ['audio/BGM_AmbientLooping.ogg',
                                 'audio/BGM_AmbientLooping.mp3']);
  }

  create() {
    // Set up the audio
    this.starSounds = {
      loud: [this.game.add.audio('star-loud-0'), this.game.add.audio('star-loud-1'),
             this.game.add.audio('star-loud-2'), this.game.add.audio('star-loud-3'),
             this.game.add.audio('star-loud-4'), this.game.add.audio('star-loud-5'),
             this.game.add.audio('star-loud-6')],
      soft: [this.game.add.audio('star-soft-0'), this.game.add.audio('star-soft-1'),
             this.game.add.audio('star-soft-2'), this.game.add.audio('star-soft-3'),
             this.game.add.audio('star-soft-4'), this.game.add.audio('star-soft-5'),
             this.game.add.audio('star-soft-6')],
    };
    this.bgm = this.game.add.audio('bgm');
    this.bgm.play('', 0, 1, true);

    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    this.graphics = this.game.add.graphics(0, 0);
    this.stars = {};
    this.connections = [];
    this.dragStartStar = null;
    this.pointerLastDown = false;
    this.pointerLastUp = false;
    this.lastClosestStar = null;

    if (window.location.hash !== '') {
      // If there's something in the hash, try to load it
      this.loadStars(window.location.hash);
      window.location.hash = '';
    } else {
      // Otherwise, randomly create some stars
      this.genStars(100);
    }

    document.getElementById('share').onclick = (e) => {
      this.shortenUrl(`http://jayhay.me/soundgazing#${this.getShareUrl()}`, (surl) => {
        document.getElementById('link').innerHTML = `<a href="${surl}" target="_blank">${surl}</a>`;
      });
      e.preventDefault();
    };
  }

  update() {
    // Find the selected star
    const pointer = this.game.input.activePointer;
    const maxDist = 10;
    let closestDist = -1;
    let closestStar = null;
    for (const star of this.stars) {
      star.update();

      const starPos = star.getPixelPos();
      star.hovered = false;

      // Get the distance from the star to the pointer
      const dist = Math.sqrt((pointer.x - starPos.x) * (pointer.x - starPos.x) +
                             (pointer.y - starPos.y) * (pointer.y - starPos.y));

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
      if (closestStar !== this.lastClosestStar) {
        // New closest star
        closestStar.playSound(false);
      }

      closestStar.hovered = true;

      if (pointer.isDown && !this.pointerLastDown) {
        this.dragStartStar = closestStar;
        this.dragStartStar.playSound(true);
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
            closestStar.playSound(true, 'noprop');
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
    this.lastClosestStar = closestStar;
  }

  render() {
    this.graphics.clear();

    // Draw the stars
    for (const star of this.stars) {
      star.draw(this.graphics);
    }

    // Draw the connections between the stars
    for (const connection of this.connections) {
      const star0 = this.stars[connection[0]].getPixelPos();
      const star1 = this.stars[connection[1]].getPixelPos();

      this.graphics.lineStyle(1, 0xffffff, 1);
      this.graphics.moveTo(star0.x - 1, star0.y - 1);
      this.graphics.lineTo(star1.x - 1, star1.y - 1);
      this.graphics.endFill();
    }

    // If dragging draw a line from the star star to the drag pos
    if (this.dragStartStar !== null) {
      const dragStarPos = this.dragStartStar.getPixelPos();
      this.graphics.lineStyle(1, 0xffffff, 1);
      this.graphics.moveTo(dragStarPos.x - 1, dragStarPos.y - 1);
      this.graphics.lineTo(this.game.input.activePointer.x - 1,
                           this.game.input.activePointer.y - 1);
      this.graphics.endFill();
    }
  }

  loadStars(string) {
    // This function is going to be kinda gross
    // Sorry

    this.stars = [];

    let buildNum = ''; // Accummulate the digits of a number

    const split = string.split('y');
    const starString = split[0];
    const conString = split[1];

    // Parse the stars!

    let starStage = 0; // 0, 1, 2 for x, y, and size
    let x;
    let y;
    let size;
    let i = 0;

    for (const char of starString) {
      if (char === 'x') {
        if (buildNum !== '') {
          if (starStage === 0) {
            x = parseInt(buildNum, 10);
          } else if (starStage === 1) {
            y = parseInt(buildNum, 10);
          } else if (starStage === 2) {
            size = parseInt(buildNum, 10);
          } else {
            console.error(`Invalid star stage ${starStage}`);
            break;
          }
        }

        if (starStage === 2) {
          // We have all the information required for a star!
          this.stars[i] = new Star(this.game, i, x / 1000.0, y / 1000.0, size);
          starStage = 0;
          i++;
        } else {
          starStage++;
        }
        buildNum = '';
      } else {
        if (char !== '#') {
          buildNum += char;
        }
      }
    }

    // Parse the connections!

    let conStage = 0; // 1, 2 for first and second connection id
    let id1;
    let id2;
    buildNum = '';

    for (const char of conString) {
      if (char === 'x') {
        if (conStage === 0) {
          id1 = parseInt(buildNum, 10);
        } else if (conStage === 1) {
          id2 = parseInt(buildNum, 10);
        } else {
          console.error(`Invalid connection stage ${conStage}`);
        }

        if (conStage === 1) {
          this.connections.push([id1, id2]);
          conStage = 0;
        } else {
          conStage++;
        }
        buildNum = '';
      } else {
        buildNum += char;
      }
    }
  }

  genStars(num) {
    this.stars = [];
    for (let i = 0; i < num; i++) {
      this.stars[i] = new Star(this.game, i,
                               Math.random() * 2 - 1, // x
                               Math.random() * 2 - 1, // y
                               Math.round(Math.random() * 6)); // size
    }
  }

  getShareUrl() {
    // Serialize stars down to their component parts
    let serializedStars = '';
    for (const star of this.stars) {
      serializedStars += `${Math.round(star.x * 1000)}x${Math.round(star.y * 1000)}x${star.size}x`;
    }

    let serializedCons = '';
    for (const con of this.connections) {
      serializedCons += `${con[0]}x${con[1]}x`;
    }

    return `${serializedStars}y${serializedCons}`;
  }

  shortenUrl(url, callback) {
    const http = new XMLHttpRequest();

    const fullUrl = `${API_URL}?access_token=${API_KEY}&longUrl=${encodeURIComponent(url)}`;

    http.onreadystatechange = () => {
      if (http.readyState === 4 && http.status === 200) {
        console.log(http.responseText);
        callback(JSON.parse(http.responseText).data.url);
      } else if (http.readyState === 4) {
        console.error(`http ${http.status}: ${http.responseText}`);
      }
    };
    http.open('GET', fullUrl, true);
    http.send(null);
  }
}

export { GameState };
