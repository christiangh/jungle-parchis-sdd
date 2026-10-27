/* <mascota-animada animal="jaguar" anim="a|b|c"> — mascota con su animación base en bucle (3 s, con pausa). */
(function () {
  const Y = '#e3b23a', OCH = '#b9811c', DK = '#2b1d0f', CR = '#fbeed2';
  const sros = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OCH}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${DK}" stroke-width="${r * .42}" stroke-dasharray="${r * 1.6} ${r * .8}" stroke-linecap="round"/>`;
  const FB = 'transform-box:fill-box;transform-origin:center';
  let n = 0;

  function jaguar(anim, u) {
    const headP = 'M0 -30 C18 -30 30 -22 32 -6 L39 3 L30 8 C28 22 16 32 0 32 C-16 32 -28 22 -30 8 L-39 3 L-32 -6 C-30 -22 -18 -30 0 -30Z';
    const css = {
      a: `.${u} .glint{animation:${u}g 3s ease-in-out infinite}
.${u} .spark{${FB};animation:${u}s 3s ease-out infinite}
.${u} .smirk{animation:${u}m 3s ease-in-out infinite}
.${u} .grin{animation:${u}n 3s ease-in-out infinite}
@keyframes ${u}g{0%,8%{transform:translateX(-30px)}32%,100%{transform:translateX(30px)}}
@keyframes ${u}s{0%,26%{transform:scale(0) rotate(0)}36%{transform:scale(1.15) rotate(45deg)}48%,100%{transform:scale(0) rotate(90deg)}}
@keyframes ${u}m{0%,40%{opacity:1}46%,78%{opacity:0}84%,100%{opacity:1}}
@keyframes ${u}n{0%,40%{opacity:0}46%,78%{opacity:1}84%,100%{opacity:0}}`,
      b: `.${u} .glasses{animation:${u}d 3s cubic-bezier(.5,0,.3,1) infinite}
.${u} .brows{animation:${u}b 3s cubic-bezier(.5,0,.3,1) infinite}
.${u} .glint{animation:${u}g 3s ease-in-out infinite}
.${u} .smirk{animation:${u}m 3s ease-in-out infinite}
.${u} .grin{animation:${u}n 3s ease-in-out infinite}
@keyframes ${u}d{0%,12%{transform:translateY(0)}24%,58%{transform:translateY(8px)}70%,100%{transform:translateY(0)}}
@keyframes ${u}b{0%,16%{transform:translateY(0)}26%,56%{transform:translateY(-3px)}66%,100%{transform:translateY(0)}}
@keyframes ${u}g{0%,70%{transform:translateX(-30px)}90%,100%{transform:translateX(30px)}}
@keyframes ${u}m{0%,26%{opacity:1}32%,58%{opacity:0}64%,100%{opacity:1}}
@keyframes ${u}n{0%,26%{opacity:0}32%,58%{opacity:1}64%,100%{opacity:0}}`,
      c: `.${u} .tilt{transform-box:view-box;transform-origin:0px 30px;animation:${u}t 3s ease-in-out infinite}
.${u} .glint{animation:${u}g 3s ease-in-out infinite}
.${u} .smirk{animation:${u}m 3s ease-in-out infinite}
.${u} .grin{animation:${u}n 3s ease-in-out infinite}
.${u} .ting{${FB};animation:${u}s 3s ease-out infinite}
@keyframes ${u}t{0%,14%{transform:rotate(0)}26%,62%{transform:rotate(-7deg)}74%,100%{transform:rotate(0)}}
@keyframes ${u}g{0%,26%{transform:translateX(-30px)}50%,100%{transform:translateX(30px)}}
@keyframes ${u}m{0%,24%{opacity:1}30%,64%{opacity:0}70%,100%{opacity:1}}
@keyframes ${u}n{0%,24%{opacity:0}30%,64%{opacity:1}70%,100%{opacity:0}}
@keyframes ${u}s{0%,36%{transform:scale(0) rotate(0)}44%{transform:scale(1.2) rotate(30deg)}56%,100%{transform:scale(0) rotate(60deg)}}`
    }[anim];
    let s = `<style>${css}</style><defs><clipPath id="${u}L"><circle cx="-12.5" cy="-5" r="9.5"/><circle cx="12.5" cy="-5" r="9.5"/></clipPath></defs>`;
    s += `<rect x="-44" y="-40" width="88" height="86" rx="28" fill="#000" opacity=".22" transform="translate(2 4)"/><rect x="-44" y="-40" width="88" height="86" rx="28" fill="#1f3a16" stroke="${Y}" stroke-width="4"/>`;
    s += `<g stroke-linejoin="round" stroke-linecap="round" transform="translate(0 4)"><g class="tilt">`;
    s += `<path d="M-30 -14 L-31 -40 L-10 -28Z M30 -14 L31 -40 L10 -28Z" fill="${Y}" stroke="${DK}" stroke-width="2.6"/><path d="M-27 -20 L-27.5 -33 L-17 -27Z M27 -20 L27.5 -33 L17 -27Z" fill="${OCH}"/>`;
    s += `<path d="${headP}" fill="${Y}" stroke="${DK}" stroke-width="2.6"/>`;
    s += sros(0, -22, 2.8) + sros(-12, -19, 2.4) + sros(12, -19, 2.4) + sros(-27, 6, 2.2) + sros(27, 6, 2.2);
    s += `<ellipse cx="-7.5" cy="12" rx="10" ry="8" fill="${CR}"/><ellipse cx="7.5" cy="12" rx="10" ry="8" fill="${CR}"/><ellipse cy="18" rx="7" ry="5" fill="${CR}"/>`;
    if (anim === 'b') {
      for (const cx of [-12.5, 12.5]) s += `<path d="M${cx - 6} -12 Q${cx} -6 ${cx + 6} -12Z" fill="#dfe27a" stroke="${DK}" stroke-width="1.3"/><ellipse cx="${cx + 1}" cy="-10.2" rx="1.5" ry="2.2" fill="${DK}"/><path d="M${cx - 7} -12.3 H${cx + 7}" stroke="${DK}" stroke-width="2.4"/>`;
      s += `<g class="brows"><path d="M-18 -18 Q-12.5 -21 -7 -18.5 M7 -18.5 Q12.5 -21 18 -18" fill="none" stroke="${DK}" stroke-width="2.4"/></g>`;
    }
    s += `<g class="glasses"><path d="M-31 -8 L-21 -6 M31 -8 L21 -6 M-4 -6 H4" stroke="${DK}" stroke-width="2.4"/><circle cx="-12.5" cy="-5" r="9.5" fill="#1e1a14"/><circle cx="12.5" cy="-5" r="9.5" fill="#1e1a14"/>`;
    s += `<path d="M-17 -9 L-11 -11 M-17.5 -5 L-8 -8.5 M8 -9 L14 -11 M7.5 -5 L17 -8.5" stroke="#fff" stroke-width="1.8" opacity=".75"/>`;
    s += `<g clip-path="url(#${u}L)">`;
    s += `<g class="glint"><path d="M-6 -20 L2 -20 L-6 10 L-14 10Z" fill="#fff" opacity=".9"/><path d="M5 -20 L8 -20 L0 10 L-3 10Z" fill="#fff" opacity=".6"/></g>`;
    s += `</g>`;
    if (anim === 'a') s += `<g transform="translate(20 -13)"><g class="spark"><path d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4Z" fill="#fff"/></g></g>`;
    s += `</g>`;
    s += `<path d="M-6 5 Q0 2 6 5 Q3 10.5 0 10.5 Q-3 10.5 -6 5Z" fill="#6e2e1e"/>`;
    s += `<g class="smirk"><path d="M0 10.5 V13.5 M0 13.5 Q-4 16.5 -7 15 M0 13.5 Q6 18 11.5 11.5" fill="none" stroke="${DK}" stroke-width="1.9"/></g>`;
    s += `<g class="grin" style="opacity:0"><path d="M0 10.5 V12.5" fill="none" stroke="${DK}" stroke-width="1.9"/><path d="M-10 12 Q1 23 13 10.5 Q2 16.5 -10 12Z" fill="${DK}" stroke="${DK}" stroke-width="1.6"/><path d="M3.5 14.8 L8 13.4 L7.4 16.2 Q5.4 16.9 3.8 16.6Z" fill="#fff"/></g>`;
    if (anim === 'c') s += `<g transform="translate(9 14)"><g class="ting"><path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z" fill="#fff" stroke="${DK}" stroke-width=".6"/></g></g>`;
    s += `<g stroke="${DK}" stroke-width="1.2" opacity=".7"><path d="M-13 15 L-31 12 M-13 18.5 L-30 20.5 M13 15 L31 12 M13 18.5 L30 20.5"/></g>`;
    return s + `</g></g>`;
  }

  function rana(anim, u) {
    const G = '#2e8b57', F1 = '#7cc242', F0 = '#5aa232', FBL = '#e6efa0';
    const wink = { a: [20, 26, 40, 46], b: [22, 28, 46, 52], c: [30, 35, 50, 56] }[anim];
    const crownK = {
      a: `0%,10%{transform:rotate(0)}24%{transform:rotate(12deg)}38%{transform:rotate(-7deg)}50%{transform:rotate(3deg)}60%,100%{transform:rotate(0)}`,
      b: `0%,12%{transform:translate(0,0) rotate(0)}26%,50%{transform:translate(7px,-6px) rotate(16deg)}64%,100%{transform:translate(0,0) rotate(0)}`,
      c: `0%,14%{transform:rotate(0)}18%{transform:rotate(-7deg)}22%{transform:rotate(7deg)}26%{transform:rotate(-6deg)}30%{transform:rotate(6deg)}34%{transform:rotate(-3deg)}38%,100%{transform:rotate(0)}`
    }[anim];
    const [w0, w1, w2, w3] = wink;
    let css = `.${u} .crown{transform-box:view-box;transform-origin:0px -22px;animation:${u}c 3s ease-in-out infinite}
@keyframes ${u}c{${crownK}}
.${u} .wink{animation:${u}w 3s ease-in-out infinite}
.${u} .open{animation:${u}o 3s ease-in-out infinite}
@keyframes ${u}w{0%,${w0}%{opacity:0}${w1}%,${w2}%{opacity:1}${w3}%,100%{opacity:0}}
@keyframes ${u}o{0%,${w0}%{opacity:1}${w1}%,${w2}%{opacity:0}${w3}%,100%{opacity:1}}`;
    if (anim === 'b') css += `.${u} .smile{animation:${u}o 3s ease-in-out infinite}.${u} .grin{animation:${u}w 3s ease-in-out infinite}`;
    if (anim === 'c') css += `.${u} .spark{transform-box:fill-box;transform-origin:center;animation:${u}s 3s ease-out infinite}.${u} .blush{animation:${u}b 3s ease-in-out infinite}
@keyframes ${u}s{0%,40%{transform:scale(0) rotate(0)}48%{transform:scale(1.2) rotate(45deg)}58%,100%{transform:scale(0) rotate(90deg)}}
@keyframes ${u}b{0%,28%{opacity:.5}40%,54%{opacity:.95}66%,100%{opacity:.5}}`;
    let s = `<style>${css}</style><defs><clipPath id="${u}B"><rect x="-42" y="-38" width="84" height="82" rx="26"/></clipPath></defs>`;
    s += `<rect x="-44" y="-40" width="88" height="86" rx="28" fill="#000" opacity=".22" transform="translate(2 4)"/><rect x="-44" y="-40" width="88" height="86" rx="28" fill="#1f3a16" stroke="${G}" stroke-width="4"/>`;
    s += `<g stroke-linejoin="round" stroke-linecap="round">`;
    s += `<g clip-path="url(#${u}B)"><path d="M-38 48 C-38 30 -26 24 0 24 C26 24 38 30 38 48Z" fill="${F0}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="0" cy="44" rx="20" ry="12" fill="${FBL}" stroke="${DK}" stroke-width="2"/></g>`;
    s += `<circle cx="-16" cy="-15" r="11.5" fill="${F1}" stroke="${DK}" stroke-width="2.6"/><circle cx="16" cy="-15" r="11.5" fill="${F1}" stroke="${DK}" stroke-width="2.6"/>`;
    s += `<ellipse cx="0" cy="5" rx="34" ry="21" fill="${F1}" stroke="${DK}" stroke-width="2.6"/><ellipse cx="0" cy="-6" rx="26" ry="10" fill="${F1}"/>`;
    s += `<path d="M-22 14 Q0 30 22 14 Q0 24 -22 14Z" fill="${FBL}" opacity=".7"/>`;
    s += [[-8, -2, 2.2], [9, -4, 1.8], [-24, 4, 1.6], [24, 6, 2], [2, -9, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${F0}"/>`).join('');
    const eye = (cx) => `<circle cx="${cx}" cy="-15" r="7.6" fill="#f2e27a" stroke="${DK}" stroke-width="1.4"/><ellipse cx="${cx + .6}" cy="-13.4" rx="3.6" ry="2.2" fill="#15120e"/><circle cx="${cx + 1.8}" cy="-14.2" r=".8" fill="#fff"/><path d="M${cx - 8} -15 A8 8 0 0 1 ${cx + 8} -15Z" fill="${F1}"/><path d="M${cx - 8.6} -15 H${cx + 8.6}" stroke="${DK}" stroke-width="2.4"/>`;
    s += eye(-16) + `<g class="open">${eye(16)}</g>`;
    s += `<g class="wink" style="opacity:0"><circle cx="16" cy="-15" r="8.2" fill="${F1}"/><path d="M9 -14 Q16 -9 23 -14" fill="none" stroke="${DK}" stroke-width="2.6"/><path d="M22 -17 l3 -2.5 M23.4 -13.6 l3.6 -.4" stroke="${DK}" stroke-width="1.6"/></g>`;
    s += `<circle cx="-4" cy="2" r="1.2" fill="${DK}"/><circle cx="4" cy="2" r="1.2" fill="${DK}"/><g class="blush"><circle cx="-25" cy="11" r="4.5" fill="#f08a6a" opacity=".5"/><circle cx="25" cy="11" r="4.5" fill="#f08a6a" opacity=".5"/></g>`;
    s += `<g class="smile"><path d="M-24 9 Q-2 22 22 9" fill="none" stroke="${DK}" stroke-width="2.4"/></g>`;
    if (anim === 'b') s += `<g class="grin" style="opacity:0"><path d="M-22 10 Q-2 30 21 10 Q-1 19 -22 10Z" fill="#8a2a2a" stroke="${DK}" stroke-width="2.2"/><path d="M-8 17.5 Q0 21 7 17" fill="none" stroke="#f07a8a" stroke-width="3"/></g>`;
    s += `<path d="M-25 7.5 l2.4 3 M24 7.5 l-2.4 3" stroke="${DK}" stroke-width="2"/>`;
    const hand = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-6 0 Q0 -6 6 0" fill="${F1}" stroke="${DK}" stroke-width="2.2"/><circle cx="-6" cy="1" r="2.6" fill="${F1}" stroke="${DK}" stroke-width="1.8"/><circle cx="0" cy="-1.5" r="2.6" fill="${F1}" stroke="${DK}" stroke-width="1.8"/><circle cx="6" cy="1" r="2.6" fill="${F1}" stroke="${DK}" stroke-width="1.8"/></g>`;
    s += hand(-18, 34) + hand(18, 34);
    s += `<g class="crown"><g transform="rotate(-8 0 -27)"><path d="M-12 -21 L-14 -34 L-6 -27 L0 -37 L6 -27 L14 -34 L12 -21Z" fill="#f2c14e" stroke="${DK}" stroke-width="2.2"/><path d="M-12 -24 H12" stroke="#c98a1e" stroke-width="1.6"/><circle cx="0" cy="-26.5" r="2.2" fill="#c8452d" stroke="${DK}" stroke-width="1"/><circle cx="-14" cy="-34" r="1.8" fill="#fff3a8" stroke="${DK}" stroke-width="1"/><circle cx="0" cy="-37" r="1.8" fill="#fff3a8" stroke="${DK}" stroke-width="1"/><circle cx="14" cy="-34" r="1.8" fill="#fff3a8" stroke="${DK}" stroke-width="1"/><path d="M-9 -30 L-8 -26" stroke="#fff" stroke-width="1.4" opacity=".7"/>`;
    if (anim === 'c') s += `<g transform="translate(2 -39)"><g class="spark"><path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z" fill="#fff" stroke="${DK}" stroke-width=".6"/></g></g>`;
    s += `</g></g>`;
    return s + `</g>`;
  }

  function loro(anim, u) {
    const R = '#c8452d', PR = '#d8432a', LINE = '#f5ead8';
    const K = {
      a: { sing: '0%,8%{transform:translate(0,0) rotate(0)}30%,40%{transform:translate(-4px,1px) rotate(-9deg)}60%,78%{transform:translate(1px,0) rotate(4deg)}92%,100%{transform:translate(0,0) rotate(0)}', open: [56, 60, 78, 82] },
      b: { sing: '0%,10%{transform:translate(0,0) rotate(0)}36%,42%{transform:translate(-5px,1px) rotate(-11deg)}56%,84%{transform:translate(1.5px,0) rotate(5deg)}96%,100%{transform:translate(0,0) rotate(0)}', open: [52, 56, 84, 88] },
      c: { sing: '0%{transform:translate(0,0) rotate(0)}12%{transform:translate(-4px,1px) rotate(-8deg)}24%{transform:translate(1px,0) rotate(4deg)}36%{transform:translate(-4px,1px) rotate(-8deg)}48%{transform:translate(1px,0) rotate(4deg)}62%,100%{transform:translate(0,0) rotate(0)}', open: null }
    }[anim];
    let css = `.${u} .sing{transform-box:view-box;transform-origin:-4px 16px;animation:${u}h 3s ease-in-out infinite}
.${u} .body{transform-box:view-box;transform-origin:-4px 46px;animation:${u}y 3s ease-in-out infinite}
@keyframes ${u}h{${K.sing}}
@keyframes ${u}y{${K.sing.replace(/translate\([^)]*\) /g, '').replace(/rotate\((-?[\d.]+)deg\)/g, (m, d) => 'rotate(' + (d * .25).toFixed(1) + 'deg)')}}
.${u} .open{animation:${u}o 3s ease-in-out infinite}
.${u} .shut{animation:${u}c 3s ease-in-out infinite}
.${u} .note{transform-box:fill-box;transform-origin:center;opacity:0}`;
    if (K.open) {
      const [a, b, c, d] = K.open;
      css += `@keyframes ${u}o{0%,${a}%{opacity:0}${b}%,${c}%{opacity:1}${d}%,100%{opacity:0}}@keyframes ${u}c{0%,${a}%{opacity:1}${b}%,${c}%{opacity:0}${d}%,100%{opacity:1}}`;
    } else css += `@keyframes ${u}o{0%,18%{opacity:0}21%,28%{opacity:1}31%,42%{opacity:0}45%,52%{opacity:1}55%,100%{opacity:0}}@keyframes ${u}c{0%,18%{opacity:1}21%,28%{opacity:0}31%,42%{opacity:1}45%,52%{opacity:0}55%,100%{opacity:1}}`;
    if (anim === 'a') css += `.${u} .n1{animation:${u}n 3s ease-out infinite}.${u} .n2{animation:${u}n 3s ease-out .35s infinite}
@keyframes ${u}n{0%,58%{opacity:0;transform:translate(0,0) scale(.6)}66%{opacity:1}92%{opacity:0;transform:translate(6px,-20px) scale(1)}100%{opacity:0}}`;
    if (anim === 'b') css += `.${u} .n1{animation:${u}p 3s ease-in-out infinite}
@keyframes ${u}p{0%,54%{opacity:0;transform:scale(.4)}62%{opacity:1;transform:scale(1.15)}70%{transform:scale(.95)}78%{transform:scale(1.15)}86%{opacity:1;transform:scale(1)}94%,100%{opacity:0;transform:scale(.8)}}
.${u} .f1,.${u} .f2,.${u} .f3{transform-box:fill-box;transform-origin:50% 100%;animation:${u}f 3s ease-in-out infinite}
.${u} .f2{animation-delay:.08s}.${u} .f3{animation-delay:.16s}
@keyframes ${u}f{0%,56%{transform:rotate(0)}62%{transform:rotate(-10deg)}68%{transform:rotate(8deg)}74%{transform:rotate(-6deg)}80%,100%{transform:rotate(0)}}`;
    if (anim === 'c') css += `.${u} .n1{animation:${u}q 3s ease-out infinite}.${u} .n2{animation:${u}q 3s ease-out .72s infinite}
@keyframes ${u}q{0%,20%{opacity:0;transform:translate(0,0) scale(.4)}25%{opacity:1;transform:translate(2px,-6px) scale(1.15)}38%{opacity:0;transform:translate(5px,-16px) scale(1)}100%{opacity:0}}`;
    let s = `<style>${css}</style><defs><clipPath id="${u}B"><rect x="-42" y="-38" width="84" height="82" rx="26"/></clipPath></defs>`;
    s += `<rect x="-44" y="-40" width="88" height="86" rx="28" fill="#000" opacity=".22" transform="translate(2 4)"/><rect x="-44" y="-40" width="88" height="86" rx="28" fill="#1f3a16" stroke="${R}" stroke-width="4"/>`;
    s += `<g stroke-linejoin="round" stroke-linecap="round">`;
    s += `<g clip-path="url(#${u}B)"><g class="body"><path d="M-36 46 C-36 20 -24 10 -6 10 C10 10 20 20 20 46Z" fill="${PR}" stroke="${DK}" stroke-width="2.4"/><path d="M-36 46 C-36 30 -32 22 -24 18 C-22 28 -22 38 -20 46Z" fill="#f2c14e" stroke="${DK}" stroke-width="2"/><path d="M-36 46 C-36 38 -35 32 -32 28 C-30 34 -30 40 -29 46Z" fill="#3a7cb0" stroke="${DK}" stroke-width="2"/></g></g>`;
    s += `<g class="sing">`;
    const feather = (d, c) => `<path class="${c}" d="${d}" fill="${PR}" stroke="${DK}" stroke-width="2.2"/>`;
    s += feather('M-14 -22 C-24 -32 -22 -44 -16 -48 C-10 -40 -8 -30 -8 -24Z', 'f1') + feather('M-6 -26 C-10 -38 -4 -48 2 -50 C6 -42 4 -32 2 -26Z', 'f2') + feather('M2 -24 C4 -36 12 -44 18 -44 C18 -36 14 -28 8 -22Z', 'f3');
    s += `<circle cx="-4" cy="-6" r="22" fill="${PR}" stroke="${DK}" stroke-width="2.6"/><path d="M-22 -14 C-18 -20 -12 -22 -6 -22" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2.4"/>`;
    s += `<ellipse cx="6" cy="-7" rx="10" ry="11.5" fill="#fbf3e6"/><path d="M-1 -2 Q4 0 9 -1 M0 2 Q5 4 10 2 M1 6 Q5 7.5 9 6" fill="none" stroke="${PR}" stroke-width="1.1" opacity=".75"/>`;
    s += `<path d="M1 -10 Q5.5 -6.5 10 -10" fill="none" stroke="${DK}" stroke-width="2.4"/>`;
    s += `<g class="shut"><path d="M13 2 C18 4 22 8 22 12 C18 14 12 10 11 5Z" fill="#2b2420" stroke="${DK}" stroke-width="2"/></g>`;
    s += `<g class="open" style="opacity:0"><g transform="rotate(22 13 2)"><path d="M13 2 C18 4 22 8 22 12 C18 14 12 10 11 5Z" fill="#2b2420" stroke="${DK}" stroke-width="2"/></g><path d="M12.5 3 C15 6 16 8 15.5 10" fill="none" stroke="#e86a7a" stroke-width="3"/></g>`;
    s += `<path d="M12 -11 C25 -15 33 -2 27 13 C25 8 21 3 13 2Z" fill="#efe6d2" stroke="${DK}" stroke-width="2.2"/><path d="M16 -9 C22 -9 26 -4 27 2" fill="none" stroke="#fff" stroke-width="1.8" opacity=".7"/><path d="M14 -4 Q16 -5 17 -3" fill="none" stroke="${DK}" stroke-width="1.3"/>`;
    s += `</g>`;
    s += `<path d="M33 22 V46" stroke="#9aa0a4" stroke-width="3"/><path d="M27 22 Q33 28 39 22" fill="none" stroke="#9aa0a4" stroke-width="2.4"/><rect x="26" y="2" width="14" height="21" rx="7" fill="#d9dcde" stroke="${DK}" stroke-width="2"/><path d="M26.5 7 H39.5 M26 11 H40 M26 15 H40 M26.5 19 H39.5" stroke="#8a9094" stroke-width="1.2"/><rect x="28" y="4" width="3" height="16" rx="1.5" fill="#fff" opacity=".6"/>`;
    const note = (x, y, k, cls) => `<g transform="translate(${x} ${y}) scale(${k})"><g class="note ${cls}"><path d="M2 0 V-10 L8 -12 V-2" fill="none" stroke="${LINE}" stroke-width="1.8"/><ellipse cx="0.4" cy="0.4" rx="2.4" ry="1.9" fill="${LINE}"/><ellipse cx="6.4" cy="-1.6" rx="2.4" ry="1.9" fill="${LINE}"/></g></g>`;
    if (anim === 'b') s += note(36, -16, 1.15, 'n1');
    else s += note(34, -10, 1, 'n1') + note(24, -20, .8, 'n2');
    return s + `</g>`;
  }

  function hipo(anim, u) {
    const B = '#3a7cb0', H1 = '#7c9cc4', H2 = '#9bb6d8', H0 = '#5d7fa8', PK = '#f2a8a0', RP = '#f07aa0', RW = '#fff5f0', W = '#8fd0ea';
    const T = 'transform-box:fill-box;transform-origin:center';
    const css = {
      a: `.${u} .sink{animation:${u}k 3s ease-in-out infinite}.${u} .ring{animation:${u}r 3s ease-in-out infinite}
@keyframes ${u}k{0%,10%{transform:translateY(0)}40%,55%{transform:translateY(15px)}68%{transform:translateY(-3px)}78%,100%{transform:translateY(0)}}
@keyframes ${u}r{0%,10%{transform:translateY(0)}40%,55%{transform:translateY(2px)}68%{transform:translateY(-1.5px)}80%,100%{transform:translateY(0)}}
.${u} .d1{animation:${u}d 3s ease-out infinite}.${u} .d2{animation:${u}e 3s ease-out infinite}
@keyframes ${u}d{0%,62%{opacity:0;transform:translate(0,0)}68%{opacity:1}88%{opacity:0;transform:translate(-10px,-16px)}100%{opacity:0}}
@keyframes ${u}e{0%,62%{opacity:0;transform:translate(0,0)}68%{opacity:1}88%{opacity:0;transform:translate(10px,-14px)}100%{opacity:0}}`,
      b: `.${u} .sink{transform-box:view-box;transform-origin:0px 20px;animation:${u}k 3s ease-in-out infinite}.${u} .ring{animation:${u}r 3s ease-in-out infinite}
@keyframes ${u}k{0%,8%{transform:translateY(0) rotate(0)}20%,40%{transform:translateY(21px) rotate(0)}52%{transform:translateY(-4px) rotate(0)}57%{transform:translateY(0) rotate(-7deg)}63%{transform:translateY(0) rotate(7deg)}69%{transform:translateY(0) rotate(-4deg)}75%,100%{transform:translateY(0) rotate(0)}}
@keyframes ${u}r{0%,8%{transform:translateY(0)}20%,40%{transform:translateY(3px)}52%{transform:translateY(-1.5px)}62%,100%{transform:translateY(0)}}
.${u} .b1,.${u} .b2,.${u} .b3{opacity:0;animation:${u}b 3s ease-in infinite}.${u} .b2{animation-delay:.18s}.${u} .b3{animation-delay:.36s}
@keyframes ${u}b{0%,20%{opacity:0;transform:translateY(0)}24%{opacity:1}42%{opacity:0;transform:translateY(-26px)}100%{opacity:0}}
.${u} .d1{animation:${u}d 3s ease-out infinite}.${u} .d2{animation:${u}e 3s ease-out infinite}
@keyframes ${u}d{0%,56%{opacity:0;transform:translate(0,0)}60%{opacity:1}78%{opacity:0;transform:translate(-14px,-10px)}100%{opacity:0}}
@keyframes ${u}e{0%,60%{opacity:0;transform:translate(0,0)}64%{opacity:1}82%{opacity:0;transform:translate(14px,-12px)}100%{opacity:0}}`,
      c: `.${u} .earL{transform-box:fill-box;transform-origin:70% 90%;animation:${u}l 3s ease-in-out infinite}.${u} .earR{transform-box:fill-box;transform-origin:30% 90%;animation:${u}m 3s ease-in-out infinite}
@keyframes ${u}l{0%,14%{transform:rotate(0)}20%{transform:rotate(-22deg)}26%{transform:rotate(6deg)}32%{transform:rotate(-18deg)}38%,100%{transform:rotate(0)}}
@keyframes ${u}m{0%,16%{transform:rotate(0)}22%{transform:rotate(22deg)}28%{transform:rotate(-6deg)}34%{transform:rotate(18deg)}40%,100%{transform:rotate(0)}}
.${u} .sink,.${u} .ring{animation:${u}k 3s ease-in-out infinite}
@keyframes ${u}k{0%,40%{transform:translateY(0)}52%{transform:translateY(2.5px)}64%{transform:translateY(-1px)}76%,100%{transform:translateY(0)}}
.${u} .shut{animation:${u}s 3s linear infinite}.${u} .open{animation:${u}o 3s linear infinite}
@keyframes ${u}s{0%,55%{opacity:0}57%,62%{opacity:1}64%,100%{opacity:0}}
@keyframes ${u}o{0%,55%{opacity:1}57%,62%{opacity:0}64%,100%{opacity:1}}`,
      d: `.${u} .muzzle{transform-box:fill-box;transform-origin:50% 30%;animation:${u}p 3s ease-in-out infinite}
@keyframes ${u}p{0%,14%{transform:scale(1)}30%,38%{transform:scale(1.08,1.1)}44%,100%{transform:scale(1)}}
.${u} .shut{animation:${u}s 3s ease-in-out infinite}.${u} .open{animation:${u}o 3s ease-in-out infinite}
@keyframes ${u}s{0%,26%{opacity:0}30%,70%{opacity:1}74%,100%{opacity:0}}
@keyframes ${u}o{0%,26%{opacity:1}30%,70%{opacity:0}74%,100%{opacity:1}}
.${u} .spout{stroke-dasharray:70;stroke-dashoffset:70;animation:${u}j 3s ease-out infinite}
@keyframes ${u}j{0%,38%{stroke-dashoffset:70;opacity:1}54%{stroke-dashoffset:0;opacity:1}70%{stroke-dashoffset:-70;opacity:1}71%,100%{opacity:0;stroke-dashoffset:70}}
.${u} .o{opacity:0;animation:${u}q 3s ease-in-out infinite}
@keyframes ${u}q{0%,38%{opacity:0}42%,44%{opacity:1}52%,100%{opacity:0}}
.${u} .f1,.${u} .f2,.${u} .f3{opacity:0;animation:${u}f 3s ease-in infinite}.${u} .f2{animation-delay:.12s}.${u} .f3{animation-delay:.24s}
@keyframes ${u}f{0%,56%{opacity:0;transform:translateY(0)}60%{opacity:1}78%{opacity:0;transform:translateY(16px)}100%{opacity:0}}`
    }[anim];
    let s = `<style>${css}</style><defs><clipPath id="${u}B"><rect x="-42" y="-38" width="84" height="82" rx="26"/></clipPath></defs>`;
    s += `<rect x="-44" y="-40" width="88" height="86" rx="28" fill="#000" opacity=".22" transform="translate(2 4)"/><rect x="-44" y="-40" width="88" height="86" rx="28" fill="#1f3a16" stroke="${B}" stroke-width="4"/>`;
    s += `<g stroke-linejoin="round" stroke-linecap="round"><g clip-path="url(#${u}B)">`;
    const ringD = (front) => {
      const d = front ? 'M33 31 A33 9.5 0 0 1 -33 31' : 'M-33 31 A33 9.5 0 0 1 33 31';
      let r = `<path d="${d}" fill="none" stroke="${DK}" stroke-width="14"/><path d="${d}" fill="none" stroke="${RP}" stroke-width="10"/><path d="${d}" fill="none" stroke="${RW}" stroke-width="10" stroke-dasharray="10 16" stroke-dashoffset="${front ? 4 : 17}" stroke-linecap="butt"/>`;
      if (front) r += `<path d="M26 35 A33 9.5 0 0 1 -26 35" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.2"/>`;
      return r;
    };
    s += `<g class="ring">${ringD(false)}<path d="M-31 27 Q-20 22 -8 23 M8 23 Q20 22 31 27" fill="none" stroke="#e8dcc0" stroke-width="1.6" stroke-dasharray="3 2"/></g>`;
    s += `<g class="sink">`;
    s += `<path d="M-40 48 C-40 30 -28 22 0 22 C28 22 40 30 40 48Z" fill="${H0}" stroke="${DK}" stroke-width="2.4"/>`;
    s += `<g class="earL"><ellipse cx="-18" cy="-27" rx="6" ry="7" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="-18" cy="-26" rx="2.8" ry="3.6" fill="${PK}"/></g><g class="earR"><ellipse cx="18" cy="-27" rx="6" ry="7" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="18" cy="-26" rx="2.8" ry="3.6" fill="${PK}"/></g>`;
    s += `<ellipse cx="0" cy="-8" rx="23" ry="19" fill="${H1}" stroke="${DK}" stroke-width="2.6"/><circle cx="-11" cy="-15" r="7.5" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><circle cx="11" cy="-15" r="7.5" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="0" cy="-6" rx="20" ry="10" fill="${H1}"/>`;
    s += `<g class="muzzle"><ellipse cx="0" cy="13" rx="31" ry="18" fill="${H2}" stroke="${DK}" stroke-width="2.6"/><ellipse cx="-11" cy="5" rx="3.6" ry="2.6" fill="#2b3a52"/><ellipse cx="11" cy="5" rx="3.6" ry="2.6" fill="#2b3a52"/><circle cx="-24" cy="14" r="4.5" fill="${PK}" opacity=".6"/><circle cx="24" cy="14" r="4.5" fill="${PK}" opacity=".6"/>`;
    if (anim === 'd') s += `<g class="open"><path d="M-17 16 Q0 27 17 16" fill="none" stroke="${DK}" stroke-width="2.2"/><path d="M-7 20.5 v3.2 h4 v-2.2 M3 21.5 v2.2 h4 v-3.2" fill="#fff" stroke="${DK}" stroke-width="1.4"/></g><g class="shut" style="opacity:0"><path d="M-8 19 Q0 22 8 19" fill="none" stroke="${DK}" stroke-width="2.2"/></g><g class="o"><ellipse cx="0" cy="20" rx="4" ry="3.4" fill="#2b3a52" stroke="${DK}" stroke-width="1.6"/></g>`;
    else s += `<path d="M-17 16 Q0 27 17 16" fill="none" stroke="${DK}" stroke-width="2.2"/><path d="M-7 20.5 v3.2 h4 v-2.2 M3 21.5 v2.2 h4 v-3.2" fill="#fff" stroke="${DK}" stroke-width="1.4"/>`;
    s += `</g><path d="M-14 -24 Q-10 -26 -6 -24" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>`;
    const eye = (cx) => `<path d="M${cx - 4.6} -15 Q${cx} -9.5 ${cx + 4.6} -15Z" fill="#fff" stroke="${DK}" stroke-width="1.3"/><circle cx="${cx + .6}" cy="-13.4" r="1.8" fill="#15120e"/><path d="M${cx - 5.4} -15.3 H${cx + 5.4}" stroke="${DK}" stroke-width="2.4"/>`;
    const shut = (cx) => `<path d="M${cx - 5} -14.5 Q${cx} -10.5 ${cx + 5} -14.5" fill="none" stroke="${DK}" stroke-width="2.4"/>`;
    if (anim === 'c' || anim === 'd') s += `<g class="open">${eye(-11)}${eye(11)}</g><g class="shut" style="opacity:0"><circle cx="-11" cy="-14" r="6" fill="${H1}"/><circle cx="11" cy="-14" r="6" fill="${H1}"/>${shut(-11)}${shut(11)}</g>`;
    else s += eye(-11) + eye(11);
    s += `</g>`;
    s += `<path d="M-44 41 Q-37 37 -30 41 T-16 41 T-2 41 T12 41 T26 41 T40 41 T54 41 V50 H-44Z" fill="${W}" opacity=".85"/><path d="M-44 41 Q-37 37 -30 41 T-16 41 T-2 41 T12 41 T26 41 T40 41 T54 41" fill="none" stroke="#fff" stroke-width="1.8" opacity=".8"/>`;
    const hand = (x) => `<ellipse cx="${x}" cy="36" rx="7.5" ry="5.5" fill="${H1}" stroke="${DK}" stroke-width="2.2"/><path d="M${x - 2.6} 37.5 v2.6 M${x + 2.6} 37.5 v2.6" stroke="${DK}" stroke-width="1.4"/>`;
    s += `<g class="ring">${ringD(true)}${hand(-15)}${hand(15)}</g></g>`;
    const drop = (x, y, c) => `<g transform="translate(${x} ${y})"><path class="${c}" d="M0 -4 Q3 0 0 2.4 Q-3 0 0 -4Z" fill="${W}" stroke="${DK}" stroke-width="1"/></g>`;
    if (anim === 'a') s += drop(-24, 26, 'd1') + drop(24, 26, 'd2');
    if (anim === 'b') {
      s += [[-6, 36, 2.6, 'b1'], [6, 37, 2, 'b2'], [0, 38, 3.2, 'b3']].map(([x, y, r, c]) => `<g transform="translate(${x} ${y})"><circle class="${c}" r="${r}" fill="none" stroke="#fff" stroke-width="1.4"/></g>`).join('');
      s += drop(-24, -16, 'd1') + drop(24, -16, 'd2');
    }
    if (anim === 'd') {
      s += `<path class="spout" d="M0 18 C2 -10 18 -44 40 -30" fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"/><path class="spout" d="M0 18 C2 -10 18 -44 40 -30" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
      s += drop(40, -24, 'f1') + drop(36, -22, 'f2') + drop(43, -20, 'f3');
    }
    return s + `</g>`;
  }
  const ANIMS = { jaguar, rana, loro, hipo };
  class MascotaAnimada extends HTMLElement {
    static get observedAttributes() { return ['animal', 'anim', 'speed', 'bob']; }
    connectedCallback() { if (!this.style.display) this.style.display = 'block'; this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const u = 'ma' + (++n), f = ANIMS[this.getAttribute('animal') || 'jaguar'] || jaguar;
      let inner = f(this.getAttribute('anim') || 'a', u);
      const sp = this.getAttribute('speed');
      if (sp) inner = inner.replace(/(\D)3s/g, '$1' + sp);
      if (this.getAttribute('bob') === 'true' && !document.getElementById('ma-bob')) {
        const st = document.createElement('style'); st.id = 'ma-bob';
        st.textContent = '@keyframes maBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6%) rotate(2deg)}}';
        document.head.appendChild(st);
      }
      const bob = this.getAttribute('bob') === 'true' ? 'animation:maBob 1.6s ease-in-out infinite;' : '';
      this.innerHTML = `<svg class="${u}" xmlns="http://www.w3.org/2000/svg" viewBox="-52 -52 104 104" style="display:block;width:100%;height:100%;overflow:visible;${bob}">${inner}</svg>`;
    }
  }
  if (!customElements.get('mascota-animada')) customElements.define('mascota-animada', MascotaAnimada);
})();
