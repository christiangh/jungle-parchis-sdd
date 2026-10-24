import { Component } from '@angular/core';

/** Jungle board drawn in SVG ("claro" variant of docs/design/tablero). */
@Component({
  selector: 'jp-board',
  templateUrl: './board.html',
  host: { class: 'block' },
})
export class Board {}
