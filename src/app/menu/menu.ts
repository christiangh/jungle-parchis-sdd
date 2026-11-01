import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

let nextId = 0;

/**
 * Gear at the top right and the side menu it opens, a modal dialog with «Nueva partida» as its only
 * option. «Nueva partida» swaps the panel for its confirmation: «Descartar partida» gives up the game
 * and «Seguir jugando» closes. Escape, a touch outside and «Cerrar» close it too; the focus goes to
 * «Cerrar» on opening, to «Seguir jugando» on confirming and back to the gear on closing. Clicks
 * inside stay inside, so the game behind keeps its selection. While open, the gear under the overlay
 * is inert, so the focus stays in the panel. The panel only slides without reduced motion (SPEC 008
 * HU-05, RF-010, RF-011, RF-012, RNF-001, RNF-002, RNF-005).
 */
@Component({
  selector: 'jp-menu',
  templateUrl: './menu.html',
  host: {
    '(click)': '$event.stopPropagation()',
    '(keydown.escape)': 'escape()',
  },
})
export class Menu {
  /** Whether the side menu is open. */
  readonly open = model(false);
  /** «Descartar partida»: the player gives up the game in progress. */
  readonly newGame = output<void>();

  /** Whether the panel shows the confirmation instead of the list. */
  protected readonly confirming = signal(false);
  protected readonly titleId = `jp-menu-${nextId++}-title`;

  private readonly injector = inject(Injector);
  private readonly gear = viewChild.required<ElementRef<HTMLButtonElement>>('gear');
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly keepButton = viewChild<ElementRef<HTMLButtonElement>>('keepButton');

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      // The list again: the confirmation only lasts until the menu closes.
      this.confirming.set(false);
      this.open.set(true);
      this.focusAfterRender(() => this.closeButton());
    }
  }

  protected confirm(): void {
    this.confirming.set(true);
    this.focusAfterRender(() => this.keepButton());
  }

  protected discard(): void {
    this.close();
    this.newGame.emit();
  }

  /** Closes the menu and takes the focus back to the gear, once it is no longer inert. */
  protected close(): void {
    this.open.set(false);
    this.focusAfterRender(() => this.gear());
  }

  protected escape(): void {
    if (this.open()) {
      this.close();
    }
  }

  /** Focuses `target` once the panel shows it: hidden elements cannot take the focus. */
  private focusAfterRender(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }
}
