import { Component } from '@angular/core';
import { Board } from './board/board';

@Component({
  imports: [Board],
  selector: 'jp-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
