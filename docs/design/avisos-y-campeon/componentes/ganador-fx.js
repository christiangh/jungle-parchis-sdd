/* Efectos de la pantalla de ganador: <ganador-trofeo>, <ganador-confeti colors="#a,#b">, <ganador-rayos color="#f2c14e"> */
(function () {
  const DK = '#2b1d0f';
  let n = 0;
  class Trofeo extends HTMLElement {
    connectedCallback() {
      const u = 'gt' + (++n);
      this.style.display = 'block';
      this.innerHTML = `<svg viewBox="0 0 120 140" style="display:block;width:100%;height:100%;overflow:visible" xmlns="http://www.w3.org/2000/svg">
<style>.${u} .sh{animation:${u}s 2.4s ease-in-out infinite}.${u} .tw{transform-box:fill-box;transform-origin:center;animation:${u}t 2.4s ease-in-out infinite}.${u} .tw2{animation-delay:1.2s}
@keyframes ${u}s{0%,20%{transform:translateX(-90px)}60%,100%{transform:translateX(90px)}}
@keyframes ${u}t{0%,100%{transform:scale(0) rotate(0)}15%{transform:scale(1) rotate(45deg)}30%{transform:scale(0) rotate(90deg)}}</style>
<g class="${u}" stroke-linejoin="round" stroke-linecap="round">
<defs><clipPath id="${u}c"><path d="M28 14 H92 C92 52 80 70 60 74 C40 70 28 52 28 14Z"/></clipPath></defs>
<ellipse cx="60" cy="134" rx="40" ry="5" fill="#000" opacity=".25"/>
<path d="M30 22 C10 20 8 48 34 54" fill="none" stroke="${DK}" stroke-width="10"/><path d="M30 22 C10 20 8 48 34 54" fill="none" stroke="#e3b23a" stroke-width="6"/>
<path d="M90 22 C110 20 112 48 86 54" fill="none" stroke="${DK}" stroke-width="10"/><path d="M90 22 C110 20 112 48 86 54" fill="none" stroke="#e3b23a" stroke-width="6"/>
<path d="M28 14 H92 C92 52 80 70 60 74 C40 70 28 52 28 14Z" fill="#f2c14e" stroke="${DK}" stroke-width="3"/>
<g clip-path="url(#${u}c)"><path d="M70 14 C70 50 66 66 60 74 L92 74 V14Z" fill="#d39a2a" opacity=".7"/><g class="sh"><path d="M40 6 L52 6 L30 80 L18 80Z" fill="#fff" opacity=".55"/></g></g>
<ellipse cx="60" cy="14" rx="32" ry="5" fill="#f7da8a" stroke="${DK}" stroke-width="3"/><ellipse cx="60" cy="15" rx="26" ry="3" fill="#c98a1e"/>
<path d="M60 30 l4.4 9 10 1.4 -7.2 7 1.7 9.9 -8.9 -4.7 -8.9 4.7 1.7 -9.9 -7.2 -7 10 -1.4Z" fill="#fff3c4" stroke="#b9811c" stroke-width="1.8"/>
<path d="M52 74 H68 L66 94 H54Z" fill="#e3b23a" stroke="${DK}" stroke-width="3"/><path d="M44 94 H76 L80 102 H40Z" fill="#f2c14e" stroke="${DK}" stroke-width="3"/>
<rect x="30" y="102" width="60" height="30" rx="5" fill="#8a5a2b" stroke="${DK}" stroke-width="3"/><path d="M33 112 C50 114 70 110 87 113 M33 122 C50 124 70 120 87 123" stroke="#5e3a17" stroke-width="1.4" fill="none" opacity=".7"/>
<rect x="44" y="109" width="32" height="15" rx="3" fill="#f2c14e" stroke="${DK}" stroke-width="2"/><path d="M50 116.5 H70" stroke="#b9811c" stroke-width="2"/>
<g transform="translate(98 8)"><path class="tw" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6Z" fill="#fff"/></g>
<g transform="translate(22 66)"><path class="tw tw2" d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4Z" fill="#fff"/></g>
</g></svg>`;
    }
  }
  class Confeti extends HTMLElement {
    connectedCallback() {
      const cols = (this.getAttribute('colors') || '#e3b23a,#f2c14e,#fff,#c8452d,#3a7cb0,#2e8b57').split(',');
      const N = +(this.getAttribute('count') || 46);
      let seed = 7; const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      if (!document.getElementById('gc-style')) {
        const st = document.createElement('style'); st.id = 'gc-style';
        st.textContent = '@keyframes gcFall{0%{top:-6%;transform:translateX(0) rotate(0)}50%{transform:translateX(18px) rotate(360deg)}100%{top:106%;transform:translateX(-12px) rotate(720deg)}}';
        document.head.appendChild(st);
      }
      this.style.cssText += ';display:block;position:absolute;inset:0;overflow:hidden;pointer-events:none';
      let h = '';
      for (let i = 0; i < N; i++) {
        const w = 6 + R() * 7, ht = R() < .4 ? w : w * .45, dur = 3.6 + R() * 3, del = -R() * dur;
        h += `<span style="position:absolute;left:${(R() * 100).toFixed(1)}%;top:-6%;width:${w.toFixed(1)}px;height:${ht.toFixed(1)}px;border-radius:${R() < .3 ? '50%' : '2px'};background:${cols[i % cols.length]};animation:gcFall ${dur.toFixed(2)}s linear ${del.toFixed(2)}s infinite"></span>`;
      }
      this.innerHTML = h;
    }
  }
  class Rayos extends HTMLElement {
    connectedCallback() {
      const c = this.getAttribute('color') || '#f2c14e';
      if (!document.getElementById('gr-style')) {
        const st = document.createElement('style'); st.id = 'gr-style';
        st.textContent = '@keyframes grSpin{to{transform:rotate(360deg)}}@keyframes grGlow{0%,100%{opacity:.75}50%{opacity:1}}';
        document.head.appendChild(st);
      }
      this.style.display = 'block';
      let rays = '';
      for (let k = 0; k < 16; k++) rays += `<path d="M-7 -40 L0 -100 L7 -40Z" fill="${k % 2 ? '#fff6c8' : c}" opacity="${k % 2 ? .35 : .5}" transform="rotate(${k * 22.5})"/>`;
      this.innerHTML = `<svg viewBox="-100 -100 200 200" style="display:block;width:100%;height:100%;overflow:visible"><defs><radialGradient id="grg"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset=".45" stop-color="${c}" stop-opacity=".35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle r="96" fill="url(#grg)" style="animation:grGlow 2s ease-in-out infinite"/><g style="animation:grSpin 14s linear infinite">${rays}</g></svg>`;
    }
  }
  if (!customElements.get('ganador-trofeo')) customElements.define('ganador-trofeo', Trofeo);
  if (!customElements.get('ganador-confeti')) customElements.define('ganador-confeti', Confeti);
  if (!customElements.get('ganador-rayos')) customElements.define('ganador-rayos', Rayos);
})();
