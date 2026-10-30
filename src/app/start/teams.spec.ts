import { COLORS, Color } from '@engine';
import { MIN_TEAMS, canStart, teamsStatus, toggleTeam } from './teams';

describe('toggleTeam', () => {
  it('RF-005: activa un equipo desactivado', () => {
    expect(toggleTeam(['yellow', 'green'], 'red')).toEqual(['yellow', 'red', 'green']);
  });

  it('RF-005: desactiva un equipo activado', () => {
    expect(toggleTeam(['yellow', 'red', 'green'], 'red')).toEqual(['yellow', 'green']);
  });

  it('RF-005: devuelve los equipos en el orden de los colores sea cual sea el orden de entrada', () => {
    expect(toggleTeam(['green', 'yellow'], 'blue')).toEqual(['yellow', 'blue', 'green']);
  });

  it('RF-005: activar y desactivar el mismo equipo deja la selección como estaba', () => {
    expect(toggleTeam(toggleTeam(COLORS, 'blue'), 'blue')).toEqual([...COLORS]);
  });

  it('RF-005: no modifica la selección recibida', () => {
    const teams: Color[] = ['yellow', 'green'];
    toggleTeam(teams, 'red');
    expect(teams).toEqual(['yellow', 'green']);
  });
});

describe('canStart', () => {
  it('HU-03.4: el mínimo es de 2 equipos', () => {
    expect(MIN_TEAMS).toBe(2);
  });

  it.each([[[]], [['green']]] as Color[][][])('HU-03.4: no se puede empezar con %j', (teams) => {
    expect(canStart(teams)).toBe(false);
  });

  it.each([[['yellow', 'green']], [['yellow', 'red', 'green']], [[...COLORS]]] as Color[][][])(
    'RF-005: se puede empezar con %j',
    (teams) => {
      expect(canStart(teams)).toBe(true);
    },
  );
});

describe('teamsStatus', () => {
  it.each([[[]], [['green']]] as Color[][][])(
    'HU-03.4: con %j pide elegir al menos 2 equipos',
    (teams) => {
      expect(teamsStatus(teams)).toBe('Elige al menos 2 equipos');
    },
  );

  it.each([
    [['yellow', 'green'], '2 equipos listos'],
    [['yellow', 'red', 'green'], '3 equipos listos'],
    [[...COLORS], '4 equipos listos'],
  ] as [Color[], string][])('RF-005: con %j dice «%s»', (teams, status) => {
    expect(teamsStatus(teams)).toBe(status);
  });
});
