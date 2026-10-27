/* mostrarCampeon('amarillo'|'rojo'|'azul'|'verde') · ocultarCampeon() */
(function () {
  const EQ = {
    amarillo: { animal: 'jaguar', anim: 'c', confeti: '#e3b23a,#f2c14e,#fff3c4,#fff,#b9811c' },
    rojo: { animal: 'loro', anim: 'c', confeti: '#c8452d,#f08a6a,#f2c14e,#fff,#9a2614' },
    azul: { animal: 'hipo', anim: 'b', confeti: '#3a7cb0,#8fd0ea,#f07aa0,#fff,#f2c14e' },
    verde: { animal: 'rana', anim: 'c', confeti: '#2e8b57,#7cc242,#f2c14e,#fff,#c8452d' }
  };
  window.mostrarCampeon = function (equipo, texto = '¡Campeón!') {
    const e = EQ[equipo] || EQ.amarillo;
    ocultarCampeon();
    const el = document.createElement('div');
    el.className = 'pj-campeon'; el.id = 'pj-campeon'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', texto);
    el.innerHTML = `<ganador-confeti colors="${e.confeti}"></ganador-confeti>
      <div class="pj-campeon__centro">
        <ganador-rayos color="#f2c14e"></ganador-rayos>
        <div class="pj-campeon__tablon pj-${equipo}">
          <div class="pj-campeon__fila"><mascota-animada animal="${e.animal}" anim="${e.anim}" bob="true"></mascota-animada><ganador-trofeo></ganador-trofeo></div>
          <span class="pj-campeon__titulo">${texto}</span>
        </div>
      </div>`;
    document.body.appendChild(el);
    return el;
  };
  window.ocultarCampeon = function () { const o = document.getElementById('pj-campeon'); if (o) o.remove(); };
})();
