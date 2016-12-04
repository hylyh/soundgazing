import 'babel-polyfill';

import * as Phaser from 'phaser';

import { GameState } from 'gamestate';

const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');
game.state.add('Game', GameState, true);

window.game = game;
