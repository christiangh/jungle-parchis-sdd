/* Parchís de la Jungla · pantalla inicial + menú
   mostrarInicio({ alJugar(equipos), seleccion? })   →  equipos: ['rojo','verde',…]
   crearMenu({ alNuevaPartida(), alConfiguracion(), proximamente: true })            */
(function () {
  const ICO = {
    check: '<path d="M20 6 9 17l-5-5"/>', plus: '<path d="M5 12h14M12 5v14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', chev: '<path d="m9 18 6-6-6-6"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    restart: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    sound: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
    access: '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>'
  };
  const svg = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[k]}</svg>`;
  const EQ = [['rojo', 'Rojo', 'loro', 'b'], ['azul', 'Azul', 'hipo', 'g'], ['verde', 'Verde', 'rana', 'a'], ['amarillo', 'Amarillo', 'jaguar', 'e']];

  window.mostrarInicio = function (opts = {}) {
    const sel = new Set(opts.seleccion || ['rojo', 'verde']);
    let capa = document.getElementById('pj-capa-inicio'), caja = document.getElementById('pj-inicio');
    if (!capa) { capa = document.createElement('div'); capa.className = 'pj-capa'; capa.id = 'pj-capa-inicio'; document.body.appendChild(capa); }
    if (!caja) { caja = document.createElement('div'); caja.className = 'pj-inicio'; caja.id = 'pj-inicio'; caja.setAttribute('role', 'dialog'); caja.setAttribute('aria-modal', 'true'); caja.setAttribute('aria-labelledby', 'pj-inicio-t'); document.body.appendChild(caja); }
    caja.innerHTML = `<div class="pj-inicio__caja">
      <div class="pj-inicio__titulo"><h2 id="pj-inicio-t">¿Quién juega?</h2><p>Elige de 2 a 4 equipos</p></div>
      <div class="pj-equipos">${EQ.map(([k, n, a, v]) => `<button type="button" class="pj-equipo pj-${k}" data-equipo="${k}" aria-pressed="${sel.has(k)}"><span class="pj-equipo__marca">${svg('check', 'ico-check')}${svg('plus', 'ico-plus')}</span><ficha-animal animal="${a}" variant="${v}"></ficha-animal><span class="pj-equipo__nombre">${n}</span></button>`).join('')}</div>
      <div class="pj-inicio__estado" aria-live="polite"></div>
      <button type="button" class="pj-boton">¡A jugar!</button>
    </div>`;
    const estado = caja.querySelector('.pj-inicio__estado'), jugar = caja.querySelector('.pj-boton');
    const pintar = () => { const n = sel.size; estado.textContent = n < 2 ? 'Elige al menos 2 equipos' : n + ' equipos listos'; jugar.disabled = n < 2; };
    caja.querySelectorAll('.pj-equipo').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.equipo; sel.has(k) ? sel.delete(k) : sel.add(k); b.setAttribute('aria-pressed', sel.has(k)); pintar();
    }));
    jugar.addEventListener('click', () => { const lista = EQ.map((e) => e[0]).filter((k) => sel.has(k)); ocultarInicio(); opts.alJugar && opts.alJugar(lista); });
    capa.hidden = false; caja.hidden = false; pintar();
    caja.querySelector('.pj-equipo').focus();
  };
  window.ocultarInicio = function () { ['pj-capa-inicio', 'pj-inicio'].forEach((id) => { const e = document.getElementById(id); if (e) e.hidden = true; }); };

  window.crearMenu = function (opts = {}) {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pj-menu-btn'; btn.setAttribute('aria-label', 'Menú'); btn.setAttribute('aria-expanded', 'false'); btn.innerHTML = svg('gear');
    const capa = document.createElement('div'); capa.className = 'pj-capa'; capa.hidden = true;
    const panel = document.createElement('aside'); panel.className = 'pj-panel'; panel.setAttribute('aria-label', 'Menú');
    const fila = (cls, ico, txt, accion) => `<button type="button" class="pj-opcion ${cls}" data-accion="${accion}"><span class="pj-opcion__icono">${svg(ico)}</span><span class="pj-opcion__texto">${txt}</span>${svg('chev', 'pj-opcion__flecha')}</button>`;
    const pronto = (ico, txt) => `<div class="pj-opcion" aria-disabled="true"><span class="pj-opcion__icono">${svg(ico)}</span><span class="pj-opcion__texto">${txt}</span><span class="pj-tag">Pronto</span></div>`;
    panel.innerHTML = `<div class="pj-panel__cabecera"><h2>Menú</h2><button type="button" class="pj-cerrar" aria-label="Cerrar">${svg('x')}</button></div>
      ${fila('pj-opcion--principal', 'restart', 'Nueva partida', 'nueva')}
      ${fila('', 'gear', 'Configuración', 'config')}
      ${opts.proximamente === false ? '' : `<div class="pj-proximamente">${pronto('sound', 'Sonido')}${pronto('access', 'Accesibilidad')}${pronto('save', 'Guardar partida')}</div>`}
      <span class="pj-panel__pie">Parchís de la Jungla</span>`;
    document.body.append(btn, capa, panel);
    const abrir = () => { panel.classList.add('abierto'); capa.hidden = false; btn.setAttribute('aria-expanded', 'true'); panel.querySelector('.pj-cerrar').focus(); };
    const cerrar = () => { panel.classList.remove('abierto'); capa.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); };
    btn.addEventListener('click', abrir); capa.addEventListener('click', cerrar);
    panel.querySelector('.pj-cerrar').addEventListener('click', cerrar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('abierto')) cerrar(); });
    panel.querySelector('[data-accion="nueva"]').addEventListener('click', () => { cerrar(); opts.alNuevaPartida && opts.alNuevaPartida(); });
    panel.querySelector('[data-accion="config"]').addEventListener('click', () => { cerrar(); opts.alConfiguracion && opts.alConfiguracion(); });
    return { abrir, cerrar, boton: btn, panel };
  };
})();
