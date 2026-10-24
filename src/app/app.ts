import { Component } from '@angular/core';
import { COLORS, createGame, GameState } from '@engine';
import { Board } from './board/board';

/** New game with the four players (RF-008). */
function newGame(): GameState {
  const game = createGame({ players: COLORS });
  if (!game.ok) {
    throw new Error(game.error);
  }
  return game.value;
}

@Component({
  imports: [Board],
  selector: 'jp-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly state = newGame();
}
