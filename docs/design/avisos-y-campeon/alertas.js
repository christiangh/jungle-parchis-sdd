/* pintarAviso(contenedor, { turno, accion, ultimo?, ultimaJugada? }) */
(function () {
  const M = { verde: ['rana', 'a'], rojo: ['loro', 'b'], azul: ['hipo', 'g'], amarillo: ['jaguar', 'e'] };
  const f = (eq) => `<ficha-animal animal="${M[eq][0]}" variant="${M[eq][1]}"></ficha-animal>`;
  window.pintarAviso = function (el, o) {
    let h = `<div class="pj-aviso" role="status" aria-live="polite"><div class="pj-turno pj-${o.turno}">${f(o.turno)}<span class="pj-turno__accion">${o.accion}</span></div>`;
    if (o.ultimo && o.ultimaJugada) h += `<div class="pj-jugada pj-${o.ultimo}">${f(o.ultimo)}<span>${o.ultimaJugada}</span></div>`;
    el.innerHTML = h + '</div>';
  };
})();
