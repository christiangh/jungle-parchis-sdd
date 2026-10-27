/* <casas-personajes variant="a|b|c|d"> — capa SVG sobre <parchis-jungla> (viewBox -40 -40 1080 1080) con los personajes integrados en las casas. */
(function () {
  const HOMES = {
    red: { x: 0, y: 0, d: [-1, -1], an: ['loro', 'b'], col: '#c8452d' },
    blue: { x: 680, y: 0, d: [1, -1], an: ['hipo', 'g'], col: '#3a7cb0' },
    yellow: { x: 680, y: 680, d: [1, 1], an: ['jaguar', 'e'], col: '#e3b23a' },
    green: { x: 0, y: 680, d: [-1, 1], an: ['rana', 'a'], col: '#2e8b57' }
  };
  const OFF = [[-62, -62], [62, -62], [-62, 62], [62, 62]];
  const DK = '#2b1d0f';
  const tok = (h, k, x, y, extra = '') => `<g transform="translate(${x} ${y}) scale(${k})" ${extra}>${window.fichaAnimalInner(h.an[0], h.an[1])}</g>`;
  // Huecos ocupados: el más cercano al centro del tablero y el de la esquina exterior quedan vacíos
  const occupied = (h) => OFF.map((o, i) => i).filter((i) => !(OFF[i][0] === h.d[0] * 62 && OFF[i][1] === h.d[1] * 62) && !(OFF[i][0] === -h.d[0] * 62 && OFF[i][1] === -h.d[1] * 62));

  function scene(key, h, cx, cy, clip) {
    let s = `<g clip-path="url(#${clip})">`;
    if (key === 'red') {
      s += `<path d="M${cx - 160} ${cy - 20} C${cx - 60} ${cy - 60} ${cx + 40} ${cy + 30} ${cx + 160} ${cy - 10}" stroke="#5a3418" stroke-width="16" fill="none" stroke-linecap="round" opacity=".55"/>`;
      for (const [lx, ly, a] of [[-90, -38, -40], [-30, -30, 30], [40, 4, -30], [100, 4, 40], [-120, -10, 160]]) s += `<path d="M0 0 C10 -14 34 -14 44 0 C34 14 10 14 0 0Z" transform="translate(${cx + lx} ${cy + ly}) rotate(${a})" fill="#2e7a32" opacity=".55"/>`;
    } else if (key === 'blue') {
      for (let i = 0; i < 7; i++) { const y = cy - 120 + i * 40; s += `<path d="M${cx - 150} ${y} q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#bfe3f2" stroke-width="3" fill="none" opacity=".5"/>`; }
    } else if (key === 'yellow') {
      for (let i = 0; i < 26; i++) { const x = cx - 130 + (i % 6) * 52 + (Math.floor(i / 6) % 2) * 26, y = cy - 120 + Math.floor(i / 6) * 56; s += `<circle cx="${x}" cy="${y}" r="9" fill="#c98a1e" opacity=".45"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#6b4a0c" stroke-width="4" stroke-dasharray="12 6" opacity=".45"/>`; }
    } else {
      for (const x of [-30, 0, 30]) s += `<path d="M${cx + x} ${cy + 140} q-4 -40 ${x / 3} -70" stroke="#1f5a2e" stroke-width="4" fill="none" opacity=".5"/>`;
      for (let i = 0; i < 5; i++) { const y = cy - 100 + i * 50; s += `<path d="M${cx - 140} ${y} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#bfe8c8" stroke-width="2.4" fill="none" opacity=".35"/>`; }
    }
    return s + `</g>`;
  }
  function slotDeco(key, x, y) {
    if (key === 'red') {
      let g = `<ellipse cx="${x + 2}" cy="${y + 6}" rx="38" ry="34" fill="#000" opacity=".25"/><ellipse cx="${x}" cy="${y + 2}" rx="37" ry="33" fill="#7a4a22" stroke="#3e220e" stroke-width="2.5"/><ellipse cx="${x}" cy="${y + 2}" rx="24" ry="21" fill="#3e220e"/><ellipse cx="${x}" cy="${y + 4}" rx="20" ry="16" fill="#5a3418"/>`;
      const tw = ['#a6743e', '#8a5a2b', '#c4935a', '#6e4220'];
      for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + ring * .2, rx = ring ? 26 : 32, ry = ring ? 23 : 29;
        const px = x + Math.cos(a) * rx, py = y + 2 + Math.sin(a) * ry, ta = a + Math.PI / 2 + (i % 2 ? .35 : -.35), L = 16;
        g += `<path d="M${(px - Math.cos(ta) * L / 2).toFixed(1)} ${(py - Math.sin(ta) * L / 2).toFixed(1)} Q${(px + 2).toFixed(1)} ${(py - 2).toFixed(1)} ${(px + Math.cos(ta) * L / 2).toFixed(1)} ${(py + Math.sin(ta) * L / 2).toFixed(1)}" stroke="${tw[(i + ring) % 4]}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      }
      return g + `<path d="M${x + 22} ${y - 30} C${x + 34} ${y - 40} ${x + 44} ${y - 34} ${x + 40} ${y - 26} C${x + 34} ${y - 24} ${x + 28} ${y - 26} ${x + 22} ${y - 30}Z" fill="#c8452d" stroke="#3e220e" stroke-width="1.6"/><path d="M${x + 22} ${y - 30} L${x + 40} ${y - 30}" stroke="#3e220e" stroke-width="1"/>`;
    }
    if (key === 'blue') {
      const r = ((x + y) % 3 - 1) * 8;
      let g = `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-36" y="-31" width="72" height="64" rx="8" fill="#000" opacity=".22" transform="translate(2 4)"/><clipPath id="tw${x}${y}"><rect x="-36" y="-31" width="72" height="64" rx="8"/></clipPath><g clip-path="url(#tw${x}${y})"><rect x="-36" y="-31" width="72" height="64" fill="#fff5f0"/>`;
      const st = ['#f07aa0', '#fff5f0', '#f2c14e', '#fff5f0', '#f07aa0', '#fff5f0', '#7fd0e8', '#fff5f0'];
      st.forEach((c, i) => g += `<rect x="${-36 + i * 9}" y="-31" width="9" height="64" fill="${c}"/>`);
      g += `<rect x="-36" y="-31" width="72" height="64" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="6"/></g><rect x="-36" y="-31" width="72" height="64" rx="8" fill="none" stroke="#1f4566" stroke-width="2.2"/>`;
      for (let i = 0; i < 9; i++) { const fx = -32 + i * 8; g += `<path d="M${fx} -31 v-5 M${fx} 33 v5" stroke="#fff5f0" stroke-width="2" stroke-linecap="round"/>`; }
      return g + `</g>`;
    }
    if (key === 'yellow') {
      let g = `<circle cx="${x + 2}" cy="${y + 4}" r="34" fill="#000" opacity=".2"/><circle cx="${x}" cy="${y}" r="34" fill="#b8862a" stroke="#6b4a0c" stroke-width="2.5"/>`;
      const cols = ['#f2d27a', '#e3b23a', '#d9a440', '#f7e2a0', '#c9922e'];
      for (let ring = 0; ring < 3; ring++) {
        const n = [18, 14, 9][ring], rr = [30, 21, 11][ring];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + ring * .4 + (x % 7) * .1, len = 12 - ring * 2;
          const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr, ta = a + Math.PI / 2 + .5;
          g += `<path d="M${(px - Math.cos(ta) * len / 2).toFixed(1)} ${(py - Math.sin(ta) * len / 2).toFixed(1)} L${(px + Math.cos(ta) * len / 2).toFixed(1)} ${(py + Math.sin(ta) * len / 2).toFixed(1)}" stroke="${cols[(i + ring) % 5]}" stroke-width="2.6" stroke-linecap="round"/>`;
        }
      }
      return g + `<circle cx="${x}" cy="${y}" r="7" fill="#8a5e1a" opacity=".5"/>`;
    }
    const rot = ((x * 7 + y * 3) % 360);
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M2 4 L40 -2 A39 39 0 1 0 40 8Z" fill="#000" opacity=".22"/><path d="M0 0 L39 -6 A39 39 0 1 0 39 6Z" fill="#5aa232" stroke="#1f5a2e" stroke-width="3" stroke-linejoin="round"/><path d="M0 0 L-26 -16 M0 0 L-28 12 M0 0 L4 30 M0 0 L8 -30 M0 0 L28 22" stroke="#1f5a2e" stroke-width="1.8" opacity=".55" stroke-linecap="round"/><path d="M-22 -22 A31 31 0 0 1 14 -28" stroke="#a6dc6a" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  }

  function build(v, turn, dimOthers) {
    let defs = '', out = '';
    for (const [key, h] of Object.entries(HOMES)) {
      const cx = h.x + 160, cy = h.y + 160, clip = 'cp-' + v + key;
      defs += `<clipPath id="${clip}"><rect x="${h.x + 30}" y="${h.y + 30}" width="260" height="260" rx="54"/></clipPath>`;
      const occ = occupied(h);
      let g = '';
      if (v === 'a' || v === 'e') {
        if (v === 'e') { g += scene(key, h, cx, cy, clip); OFF.forEach(([dx, dy]) => g += slotDeco(key, cx + dx, cy + dy)); }
        const ox = h.d[0] < 0 ? h.x + 22 : h.x + 298, oy = h.d[1] < 0 ? h.y + 22 : h.y + 298;
        const on = turn === key, off = turn && !on && dimOthers;
        let m = '';
        if (on) m += `<circle cx="${ox}" cy="${oy}" r="74" fill="#fff6c8" class="cp-glow"/><circle cx="${ox}" cy="${oy}" r="70" fill="none" stroke="#fff3a8" stroke-width="7" class="cp-pulse"/><circle cx="${ox}" cy="${oy}" r="70" fill="none" stroke="#fff" stroke-width="5"/>`;
        else m += `<circle cx="${ox}" cy="${oy}" r="64" fill="#000" opacity=".25"/>`;
        m += on ? `<g class="cp-breath">${tok(h, 1.18, ox, oy)}</g>` : tok(h, 1.18, ox, oy);
        g += off ? `<g opacity=".55">${m}</g>` : m;
      } else if (v === 'b') {
        g += scene(key, h, cx, cy, clip);
        OFF.forEach(([dx, dy]) => g += slotDeco(key, cx + dx, cy + dy));
      } else if (v === 'c') {
        OFF.forEach(([dx, dy], i) => { if (!occ.includes(i)) g += `<g opacity=".28" style="mix-blend-mode:multiply">${tok(h, .62, cx + dx, cy + dy)}</g>`; });
      } else if (v === 'd') {
        g += `<circle cx="${cx + 3}" cy="${cy + 6}" r="54" fill="#000" opacity=".3"/><circle cx="${cx}" cy="${cy}" r="54" fill="#c99a62" stroke="#74491f" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="47" fill="none" stroke="${h.col}" stroke-width="6"/>`;
        g += `<path d="M${cx - 40} ${cy - 18} C${cx - 10} ${cy - 16} ${cx + 10} ${cy - 20} ${cx + 40} ${cy - 18} M${cx - 44} ${cy + 10} C${cx - 10} ${cy + 12} ${cx + 10} ${cy + 8} ${cx + 44} ${cy + 10}" stroke="#9e6d3b" stroke-width="2" fill="none" opacity=".6"/>`;
        g += tok(h, .78, cx, cy - 2);
      }
      occ.forEach((i) => g += tok(h, .62, cx + OFF[i][0], cy + OFF[i][1]));
      out += g;
    }
    const css = `<style>.cp-glow{opacity:.55;animation:cpGlow 1.6s ease-in-out infinite}.cp-pulse{transform-box:fill-box;transform-origin:center;animation:cpPulse 1.6s ease-out infinite}.cp-breath{transform-box:fill-box;transform-origin:center;animation:cpBreath 1.6s ease-in-out infinite}@keyframes cpGlow{0%,100%{opacity:.5}50%{opacity:.95}}@keyframes cpPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.45);opacity:0}}@keyframes cpBreath{0%,100%{transform:scale(1.04)}50%{transform:scale(1.11)}}</style>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 1080 1080" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none">${css}<defs>${defs}</defs>${out}</svg>`;
  }
  class CasasPersonajes extends HTMLElement {
    static get observedAttributes() { return ['variant', 'turn', 'dim']; }
    connectedCallback() { this.style.display = 'block'; this.style.position = 'absolute'; this.style.inset = '0'; this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      if (!window.fichaAnimalInner) { clearTimeout(this._t); this._t = setTimeout(() => this.render(), 80); return; }
      this.innerHTML = build(this.getAttribute('variant') || 'a', this.getAttribute('turn'), this.getAttribute('dim') === 'true');
    }
  }
  if (!customElements.get('casas-personajes')) customElements.define('casas-personajes', CasasPersonajes);
})();
