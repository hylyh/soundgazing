import 'babel-polyfill';

import * as Phaser from 'phaser';

import { GameState } from 'gamestate';

const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');
game.state.add('Game', GameState, true);

document.getElementById('share').onclick = (e) => {
  // Generate a share url
  const info = game.state.getCurrentState().getShareUrl();
  window.location = `#${info}`;
  e.preventDefault();
};

window.game = game;
