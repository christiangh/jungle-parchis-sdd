import { TestBed } from '@angular/core/testing';
import { COLORS } from '@engine';
import { App } from './app';
import { homes } from './board/board-geometry';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('RNF-001: shows the board inside the main landmark', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('main [data-board-slot] jp-board svg')).not.toBeNull();
    expect(compiled.querySelector('h1')).toBeNull();
  });

  it('RF-008: la aplicación muestra una partida nueva de 4 jugadores', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('jp-board [data-piece]')).toHaveLength(16);
    for (const color of COLORS) {
      const home = homes().find((h) => h.color === color)!;
      const centers = Array.from(
        compiled.querySelectorAll(
          `jp-board [data-piece][data-color="${color}"] [data-part="disc"]`,
        ),
      ).map((disc) => ({ x: Number(disc.getAttribute('cx')), y: Number(disc.getAttribute('cy')) }));
      expect(centers, color).toEqual(home.slots);
    }
  });
});
