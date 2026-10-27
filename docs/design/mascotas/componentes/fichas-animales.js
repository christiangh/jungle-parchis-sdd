/* <ficha-animal animal="jaguar" variant="a|b|c" context="solo|tablon"> — fichas ilustradas, viewBox -50 -50 100 100. */
(function () {
  const INK = '#3b2412', Y = '#e3b23a', YL = '#f2c14e', CREAM = '#fff3d6', SPOT = '#4a2c10', SPOTC = '#c98a1e', BLUSH = '#f08a6a';
  const ros = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SPOTC}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${SPOT}" stroke-width="${r * .55}" stroke-dasharray="${r * 1.4} ${r * .7}" stroke-linecap="round"/>`;
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SPOT}"/>`;

  function head(eyes) {
    const ears = (fill, stroke, sw) => `<circle cx="-24" cy="-23" r="11" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/><circle cx="24" cy="-23" r="11" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    let s = `<g stroke-linejoin="round" stroke-linecap="round">`;
    s += ears('#fff', '#fff', 8) + `<circle r="32" fill="#fff" stroke="#fff" stroke-width="8"/>`;
    s += ears(Y, INK, 3) + `<circle cx="-24" cy="-23" r="5.5" fill="#f6b9a0"/><circle cx="24" cy="-23" r="5.5" fill="#f6b9a0"/>`;
    s += `<circle r="32" fill="${YL}" stroke="${INK}" stroke-width="3"/>`;
    s += ros(0, -24, 3.2) + ros(-12, -20, 2.8) + ros(12, -20, 2.8) + dot(-26, -3, 2.2) + dot(-23, 6, 1.7) + dot(26, -3, 2.2) + dot(23, 6, 1.7);
    s += `<ellipse cx="-7.5" cy="10" rx="10" ry="8" fill="${CREAM}"/><ellipse cx="7.5" cy="10" rx="10" ry="8" fill="${CREAM}"/><ellipse cx="0" cy="16" rx="7" ry="5" fill="${CREAM}"/>`;
    s += `<circle cx="-19" cy="7" r="4.5" fill="${BLUSH}" opacity=".55"/><circle cx="19" cy="7" r="4.5" fill="${BLUSH}" opacity=".55"/>`;
    s += [[-10, 9], [-13, 12], [-8, 13], [10, 9], [13, 12], [8, 13]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="${INK}" opacity=".6"/>`).join('');
    s += `<path d="M-6 3 Q0 0 6 3 Q3 8.5 0 8.5 Q-3 8.5 -6 3Z" fill="#7a3424"/><path d="M0 8.5 V11.5 M0 11.5 Q-4 15.5 -8 12.5 M0 11.5 Q4 15.5 8 12.5" fill="none" stroke="${INK}" stroke-width="2"/>`;
    if (eyes === 'closed') s += `<path d="M-17 -5 Q-12 0 -7 -5 M7 -5 Q12 0 17 -5" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    else s += `<ellipse cx="-12" cy="-5" rx="5" ry="6.2" fill="${INK}"/><ellipse cx="12" cy="-5" rx="5" ry="6.2" fill="${INK}"/><circle cx="-10.2" cy="-7.4" r="2.1" fill="#fff"/><circle cx="13.8" cy="-7.4" r="2.1" fill="#fff"/><circle cx="-13.4" cy="-2.8" r=".9" fill="#fff"/><circle cx="10.6" cy="-2.8" r=".9" fill="#fff"/>`;
    return s + `</g>`;
  }
  const paw = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="8.5" ry="6.5" fill="${YL}" stroke="${INK}" stroke-width="2.6"/><path d="M-2.8 1.5 V5.5 M2.8 1.5 V5.5" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/></g>`;

  const JAGUAR = {
    a: () => `<ellipse cx="2" cy="40" rx="30" ry="6" fill="#000" opacity=".22"/>${head('open')}`,
    b: () => {
      let s = `<ellipse cx="2" cy="42" rx="38" ry="6" fill="#000" opacity=".22"/><g stroke-linejoin="round" stroke-linecap="round">`;
      s += `<ellipse cx="6" cy="2" rx="40" ry="36" fill="#fff"/><ellipse cx="6" cy="2" rx="36" ry="32" fill="${Y}" stroke="${INK}" stroke-width="3"/>`;
      s += ros(22, -16, 3.6) + ros(32, 2, 3.2) + ros(10, -26, 3) + ros(26, 18, 3.4) + ros(-4, -26, 2.6) + dot(36, -10, 2) + dot(14, 26, 2.2);
      s += `<path d="M34 16 C38 34 14 42 -10 38 C-24 35 -32 28 -33 20" fill="none" stroke="${INK}" stroke-width="13"/><path d="M34 16 C38 34 14 42 -10 38 C-24 35 -32 28 -33 20" fill="none" stroke="${YL}" stroke-width="8"/>`;
      s += `<path d="M14 38.5 l-1 -4 M2 39 l0 -4 M-10 38 l1 -4" stroke="${SPOT}" stroke-width="2.4"/><circle cx="-33" cy="20" r="5" fill="${SPOT}"/>`;
      s += `<g transform="translate(-12 -2) rotate(-14) scale(.62)">${head('closed')}</g>`;
      s += paw(-24, 18, -10) + paw(-8, 22, 8) + `</g>`;
      s += `<g fill="${INK}" font-family="Figtree, system-ui, sans-serif" font-weight="800"><text x="22" y="-28" font-size="11">z</text><text x="30" y="-36" font-size="8">z</text></g>`;
      return s;
    },
    c: () => {
      let s = `<ellipse cx="2" cy="44" rx="34" ry="6" fill="#000" opacity=".22"/><defs><clipPath id="fa-wood"><circle r="45"/></clipPath></defs>`;
      s += `<circle r="45" fill="#c99a62" stroke="#74491f" stroke-width="3"/><g clip-path="url(#fa-wood)" fill="none" stroke="#9e6d3b" stroke-width="1.1" opacity=".7"><path d="M-50 -30 C-20 -27 20 -33 50 -29"/><path d="M-50 -14 C-20 -11 20 -17 50 -13"/><path d="M-50 4 C-20 7 20 1 50 5"/><path d="M-50 22 C-20 25 20 19 50 23"/><path d="M-50 36 C-20 39 20 33 50 37"/></g>`;
      s += `<circle r="38" fill="${Y}" stroke="rgba(0,0,0,.3)" stroke-width="2"/><circle r="35" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`;
      s += `<g transform="translate(0 -3) scale(.86)">${head('open')}</g>` + paw(-13, 32, -6) + paw(13, 32, 6);
      return s;
    }
  };
  const OCH = '#b9811c', DK = '#2b1d0f', CR = '#fbeed2', IRIS = '#dfe27a';
  const sros = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OCH}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${DK}" stroke-width="${r * .42}" stroke-dasharray="${r * 1.6} ${r * .8}" stroke-linecap="round"/>`;
  const shadow = (w) => `<ellipse cx="2" cy="42" rx="${w}" ry="5.5" fill="#000" opacity=".22"/>`;
  const whisk = `<g stroke="${DK}" stroke-width="1.2" stroke-linecap="round" opacity=".7"><path d="M-13 13 L-31 10 M-13 16.5 L-30 18.5 M13 13 L31 10 M13 16.5 L30 18.5"/></g>`;
  // Ojo «aburrido»: párpado recto, media luna inferior con pupila
  const lazyEye = (cx, flip) => `<path d="M${cx - 8} -6 Q${cx} 2 ${cx + 8} -6Z" fill="${IRIS}" stroke="${DK}" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="${cx + (flip ? -1 : 1)}" cy="-3.6" rx="1.7" ry="2.6" fill="${DK}"/><path d="M${cx - 9} -6.3 H${cx + 9}" stroke="${DK}" stroke-width="2.8" stroke-linecap="round"/>`;
  Object.assign(JAGUAR, {
    d: () => {
      const headP = 'M0 34 L-24 18 L-34 -2 L-29 -22 L-31 -38 L-15 -29 L0 -31 L15 -29 L31 -38 L29 -22 L34 -2 L24 18Z';
      let s = shadow(28) + `<g stroke-linejoin="round" stroke-linecap="round">`;
      s += `<path d="${headP}" fill="#fff" stroke="#fff" stroke-width="9"/><path d="${headP}" fill="${Y}" stroke="${DK}" stroke-width="2.6"/>`;
      s += `<path d="M-27 -25 L-28 -33 L-19 -28Z M27 -25 L28 -33 L19 -28Z" fill="${OCH}" stroke="${OCH}" stroke-width="2"/>`;
      s += `<path d="M0 -31 L-8 -12 L0 -4 L8 -12Z" fill="${OCH}" opacity=".35"/>`;
      s += sros(0, -21, 2.6) + sros(-13, -18, 2.4) + sros(13, -18, 2.4) + sros(-25, 3, 2.4) + sros(25, 3, 2.4) + sros(-20, 13, 1.8) + sros(20, 13, 1.8);
      s += `<path d="M0 1 L-15 10 L-10 24 L0 30 L10 24 L15 10Z" fill="${CR}" stroke="${CR}" stroke-width="3"/>`;
      s += lazyEye(-14, false) + lazyEye(14, true);
      s += `<path d="M-6 4 L6 4 L0 11Z" fill="#6e2e1e" stroke="#6e2e1e" stroke-width="2.5"/><path d="M0 11 V15 M0 15 Q-4 18 -7 16 M0 15 Q6 19 11 12" fill="none" stroke="${DK}" stroke-width="1.9"/>` + whisk;
      return s + `</g>`;
    },
    e: () => {
      const headP = 'M0 -30 C18 -30 30 -22 32 -6 L39 3 L30 8 C28 22 16 32 0 32 C-16 32 -28 22 -30 8 L-39 3 L-32 -6 C-30 -22 -18 -30 0 -30Z';
      let s = `<rect x="-44" y="-40" width="88" height="86" rx="28" fill="#000" opacity=".22" transform="translate(2 4)"/><rect x="-44" y="-40" width="88" height="86" rx="28" fill="#1f3a16" stroke="${Y}" stroke-width="4"/>`;
      s += `<g stroke-linejoin="round" stroke-linecap="round" transform="translate(0 4)">`;
      s += `<path d="M-30 -14 L-31 -40 L-10 -28Z M30 -14 L31 -40 L10 -28Z" fill="${Y}" stroke="${DK}" stroke-width="2.6"/><path d="M-27 -20 L-27.5 -33 L-17 -27Z M27 -20 L27.5 -33 L17 -27Z" fill="${OCH}"/>`;
      s += `<path d="${headP}" fill="${Y}" stroke="${DK}" stroke-width="2.6"/>`;
      s += sros(0, -22, 2.8) + sros(-12, -19, 2.4) + sros(12, -19, 2.4) + sros(-27, 6, 2.2) + sros(27, 6, 2.2);
      s += `<ellipse cx="-7.5" cy="12" rx="10" ry="8" fill="${CR}"/><ellipse cx="7.5" cy="12" rx="10" ry="8" fill="${CR}"/><ellipse cy="18" rx="7" ry="5" fill="${CR}"/>`;
      s += `<path d="M-31 -8 L-21 -6 M31 -8 L21 -6 M-4 -6 H4" stroke="${DK}" stroke-width="2.4"/><circle cx="-12.5" cy="-5" r="9.5" fill="#1e1a14"/><circle cx="12.5" cy="-5" r="9.5" fill="#1e1a14"/>`;
      s += `<path d="M-17 -9 L-11 -11 M-17.5 -5 L-8 -8.5 M8 -9 L14 -11 M7.5 -5 L17 -8.5" stroke="#fff" stroke-width="1.8" opacity=".75"/>`;
      s += `<path d="M-6 5 Q0 2 6 5 Q3 10.5 0 10.5 Q-3 10.5 -6 5Z" fill="#6e2e1e"/><path d="M0 10.5 V13.5 M0 13.5 Q-4 16.5 -7 15 M0 13.5 Q6 18 11.5 11.5" fill="none" stroke="${DK}" stroke-width="1.9"/>`;
      s += `<g transform="translate(0 2)">${whisk}</g>`;
      return s + `</g>`;
    },
    f: () => {
      let s = shadow(34) + `<circle r="45" fill="${OCH}" stroke="${DK}" stroke-width="2.6"/>`;
      for (let k = 0; k < 12; k++) { const a = k * 30 * Math.PI / 180; s += sros(Math.round(Math.cos(a) * 40.5 * 10) / 10, Math.round(Math.sin(a) * 40.5 * 10) / 10, 2); }
      s += `<circle r="36" fill="${Y}" stroke="${DK}" stroke-width="2"/>`;
      s += `<g fill="none" stroke="${DK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">`;
      s += `<path d="M-20 -14 L-22 -28 L-9 -21 Q0 -24 9 -21 L22 -28 L20 -14 Q26 -4 24 8 Q20 24 0 27 Q-20 24 -24 8 Q-26 -4 -20 -14Z" fill="${YL}"/>`;
      s += `<path d="M-15 -8 Q-10 -12 -5 -8 M5 -9 Q10 -9 15 -7"/><path d="M6 -14 L15 -17" stroke-width="2"/>`;
      s += `<circle cx="10" cy="-5" r="2.2" fill="${DK}" stroke="none"/>`;
      s += `<path d="M-5 4 L5 4 L0 9Z" fill="#6e2e1e" stroke="#6e2e1e"/><path d="M0 9 V12 Q-4 16 -8 13 M0 12 Q5 16 10 11"/>`;
      s += `<path d="M-11 10 L-21 8 M-11 13 L-20 14 M11 10 L21 8 M11 13 L20 14" stroke-width="1.2" opacity=".7"/>`;
      s += `</g><g fill="${DK}"><circle cx="0" cy="-17" r="1.6"/><circle cx="-6" cy="-15" r="1.2"/><circle cx="6" cy="-15" r="1.2"/><circle cx="-17" cy="6" r="1.3"/><circle cx="17" cy="6" r="1.3"/></g>`;
      return s;
    }
  });
  const badge = (ring) => `<rect x="-44" y="-40" width="88" height="86" rx="28" fill="#000" opacity=".22" transform="translate(2 4)"/><rect x="-44" y="-40" width="88" height="86" rx="28" fill="#1f3a16" stroke="${ring}" stroke-width="4"/>`;
  const R = '#c8452d', RD = '#8e2a1a', LINE = '#f5ead8';
  function toucan(acc) {
    let s = badge(R) + `<defs><clipPath id="fa-tb"><rect x="-42" y="-38" width="84" height="82" rx="26"/></clipPath><clipPath id="fa-th"><circle cx="-6" cy="-4" r="22"/><path d="M-34 46 C-34 20 -22 10 -6 10 C10 10 22 20 22 46Z"/></clipPath></defs>`;
    s += `<g stroke-linejoin="round" stroke-linecap="round">`;
    s += `<g clip-path="url(#fa-tb)"><path d="M-34 46 C-34 20 -22 10 -6 10 C10 10 22 20 22 46Z" fill="#15120e" stroke="${LINE}" stroke-width="2.4"/></g>`;
    s += `<circle cx="-6" cy="-4" r="22" fill="#15120e" stroke="${LINE}" stroke-width="2.4"/>`;
    s += `<g clip-path="url(#fa-th)"><path d="M-26 4 C-24 22 -8 30 6 26 C12 16 8 2 -2 -2 C-12 -4 -24 -4 -26 4Z" fill="#ffe9a3"/><path d="M-22 20 C-14 28 -2 30 6 26 L10 34 L-24 34Z" fill="${R}" opacity=".9"/></g>`;
    if (acc === 'headphones') s += `<path d="M-31 -2 C-32 -30 18 -34 18 -8" fill="none" stroke="#e9e4d6" stroke-width="4.5"/>`;
    const bill = 'M10 -16 C24 -25 42 -20 48 -6 C44 -2 28 -1 12 -1Z';
    s += `<path d="${bill}" fill="#f2a33a" stroke="${LINE}" stroke-width="5"/><path d="M12 -1 C28 0 42 -1 47 -4 C43 5 28 9 12 5Z" fill="#e07a2a" stroke="${LINE}" stroke-width="5"/>`;
    s += `<path d="${bill}" fill="#f2a33a" stroke="${DK}" stroke-width="2"/><path d="M10 -16 C14 -18 17 -19 19 -19.5 L19 -1 L12 -1Z" fill="#a6c43c"/><path d="M38 -18 C43 -15 47 -10 48 -6 C45 -3 41 -2 38 -1.5Z" fill="${R}"/>`;
    s += `<path d="M12 -1 C28 0 42 -1 47 -4 C43 5 28 9 12 5Z" fill="#e07a2a" stroke="${DK}" stroke-width="2"/><path d="${bill}" fill="none" stroke="${DK}" stroke-width="2"/>`;
    s += `<path d="M22 -17 C30 -18 38 -15 42 -11" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/><path d="M12 -1 Q9 3 6 2" fill="none" stroke="${LINE}" stroke-width="1.8"/>`;
    s += `<circle cx="-1" cy="-9" r="7.5" fill="#5fb0d8"/><circle cx="-1" cy="-9" r="4.6" fill="#fff"/><circle cx="0" cy="-8" r="2.6" fill="#15120e"/><circle cx="1" cy="-9.2" r=".9" fill="#fff"/>`;
    s += `<path d="M-8.5 -11 C-6 -15 4 -15 6.5 -11 L6.5 -10.5 L-8.5 -10.5Z" fill="#15120e"/><path d="M-8.8 -10.6 H6.8" stroke="#5fb0d8" stroke-width="1.6"/>`;
    if (acc === 'bowtie') {
      s += `<g transform="translate(-6 16)"><path d="M0 0 L-15 -8 Q-18 0 -15 8Z M0 0 L15 -8 Q18 0 15 8Z" fill="${R}" stroke="${LINE}" stroke-width="2"/><g fill="#fff" opacity=".85"><circle cx="-10" cy="-3" r="1.4"/><circle cx="-12" cy="3" r="1.4"/><circle cx="-6" cy="1" r="1.2"/><circle cx="10" cy="-3" r="1.4"/><circle cx="12" cy="3" r="1.4"/><circle cx="6" cy="1" r="1.2"/></g><rect x="-3.5" y="-4" width="7" height="8" rx="2.5" fill="${RD}" stroke="${LINE}" stroke-width="1.6"/></g>`;
    } else if (acc === 'headphones') {
      s += `<rect x="-36" y="-12" width="11" height="18" rx="5" fill="${R}" stroke="${LINE}" stroke-width="2"/><rect x="-33" y="-9" width="3" height="12" rx="1.5" fill="${RD}"/>`;
      s += `<g fill="${LINE}" opacity=".85"><path d="M-34 -24 v-7 l5 -1.5 v7" fill="none" stroke="${LINE}" stroke-width="1.6"/><circle cx="-35.5" cy="-24" r="2"/><circle cx="-30.5" cy="-25.5" r="2"/></g>`;
    } else if (acc === 'monocle') {
      s += `<circle cx="-1" cy="-9" r="10" fill="#fff" fill-opacity=".14" stroke="#e3b23a" stroke-width="2.4"/><path d="M-6 -0.5 C-12 10 -6 18 -14 26" fill="none" stroke="#e3b23a" stroke-width="1.4" stroke-dasharray="2 1.6"/>`;
      s += `<path d="M-22 -22 C-14 -36 4 -36 10 -24 Q-6 -20 -22 -22Z" fill="${R}" stroke="${LINE}" stroke-width="2"/><path d="M-25 -21 Q-6 -16 13 -24" fill="none" stroke="${LINE}" stroke-width="2.4"/><circle cx="-6" cy="-33" r="2.4" fill="${RD}" stroke="${LINE}" stroke-width="1.4"/>`;
    }
    return s + `</g>`;
  }
  const TUCAN = { a: () => toucan('bowtie'), b: () => toucan('headphones'), c: () => toucan('monocle') };
  function parrot(mic) {
    const PR = '#d8432a', PRD = '#9a2614';
    let s = badge(R) + `<defs><clipPath id="fa-pb"><rect x="-42" y="-38" width="84" height="82" rx="26"/></clipPath></defs><g stroke-linejoin="round" stroke-linecap="round">`;
    const feather = (d) => `<path d="${d}" fill="${PR}" stroke="${DK}" stroke-width="2.2"/>`;
    s += feather('M-14 -22 C-24 -32 -22 -44 -16 -48 C-10 -40 -8 -30 -8 -24Z') + feather('M-6 -26 C-10 -38 -4 -48 2 -50 C6 -42 4 -32 2 -26Z') + feather('M2 -24 C4 -36 12 -44 18 -44 C18 -36 14 -28 8 -22Z');
    s += `<g clip-path="url(#fa-pb)"><path d="M-36 46 C-36 20 -24 10 -6 10 C10 10 20 20 20 46Z" fill="${PR}" stroke="${DK}" stroke-width="2.4"/><path d="M-36 46 C-36 30 -32 22 -24 18 C-22 28 -22 38 -20 46Z" fill="#f2c14e" stroke="${DK}" stroke-width="2"/><path d="M-36 46 C-36 38 -35 32 -32 28 C-30 34 -30 40 -29 46Z" fill="#3a7cb0" stroke="${DK}" stroke-width="2"/></g>`;
    s += `<circle cx="-4" cy="-6" r="22" fill="${PR}" stroke="${DK}" stroke-width="2.6"/><path d="M-22 -14 C-18 -20 -12 -22 -6 -22" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2.4"/>`;
    if (mic === 'headset') s += `<path d="M-17 -6 C-18 -26 0 -32 8 -27" fill="none" stroke="#15120e" stroke-width="3.4"/><rect x="-23" y="-10" width="11" height="15" rx="5" fill="#15120e" stroke="${LINE}" stroke-width="1.8"/><rect x="-20" y="-7" width="5" height="9" rx="2.5" fill="${R}"/>`;
    s += `<ellipse cx="6" cy="-7" rx="10" ry="11.5" fill="#fbf3e6"/><path d="M-1 -2 Q4 0 9 -1 M0 2 Q5 4 10 2 M1 6 Q5 7.5 9 6" fill="none" stroke="${PR}" stroke-width="1.1" opacity=".75"/>`;
    if (mic === 'stand') s += `<path d="M1 -10 Q5.5 -6.5 10 -10" fill="none" stroke="${DK}" stroke-width="2.4"/>`;
    else s += `<circle cx="5.5" cy="-9.5" r="4" fill="#f2e7a0" stroke="${DK}" stroke-width="1.4"/><circle cx="6.3" cy="-8.8" r="2" fill="#15120e"/><circle cx="7" cy="-9.6" r=".7" fill="#fff"/><path d="M.8 -11.6 H10.2" stroke="${DK}" stroke-width="2.4"/>`;
    const open = mic !== 'stand';
    s += open
      ? `<g transform="rotate(18 13 2)"><path d="M13 2 C18 4 22 8 22 12 C18 14 12 10 11 5Z" fill="#2b2420" stroke="${DK}" stroke-width="2"/></g><path d="M12.5 3 C15 6 16 8 15.5 10" fill="none" stroke="#e86a7a" stroke-width="3"/>`
      : `<path d="M13 2 C18 4 22 8 22 12 C18 14 12 10 11 5Z" fill="#2b2420" stroke="${DK}" stroke-width="2"/>`;
    s += `<path d="M12 -11 C25 -15 33 -2 27 13 C25 8 21 3 13 2Z" fill="#efe6d2" stroke="${DK}" stroke-width="2.2"/><path d="M16 -9 C22 -9 26 -4 27 2" fill="none" stroke="#fff" stroke-width="1.8" opacity=".7"/><path d="M14 -4 Q16 -5 17 -3" fill="none" stroke="${DK}" stroke-width="1.3"/>`;
    if (mic === 'hand') {
      s += `<path d="M30 16 L18 36" stroke="#15120e" stroke-width="6"/><path d="M30 16 L18 36" stroke="#4a4a4a" stroke-width="3"/><circle cx="32" cy="13" r="7.5" fill="#5a5d60" stroke="${LINE}" stroke-width="2"/><path d="M26 11 H38 M25.5 15 H38.5 M29 7 V19 M33 6 V20" stroke="#2c2e30" stroke-width="1.1"/><circle cx="29.5" cy="10.5" r="2" fill="#fff" opacity=".5"/>`;
      s += `<ellipse cx="18" cy="32" rx="9" ry="6" fill="${PR}" stroke="${DK}" stroke-width="2.2" transform="rotate(-35 18 32)"/><path d="M14 30 l5 -3 M16 34 l5 -3" stroke="${PRD}" stroke-width="1.4"/>`;
      s += `<g fill="${LINE}"><path d="M33 -24 v-9 l6 -2 v9" fill="none" stroke="${LINE}" stroke-width="1.7"/><circle cx="31.4" cy="-24" r="2.2"/><circle cx="37.4" cy="-26" r="2.2"/><path d="M24 -30 v-6" stroke="${LINE}" stroke-width="1.6"/><circle cx="22.5" cy="-30" r="1.9"/></g>`;
    } else if (mic === 'stand') {
      s += `<path d="M33 22 V46" stroke="#9aa0a4" stroke-width="3"/><path d="M27 22 Q33 28 39 22" fill="none" stroke="#9aa0a4" stroke-width="2.4"/><rect x="26" y="2" width="14" height="21" rx="7" fill="#d9dcde" stroke="${DK}" stroke-width="2"/><path d="M26.5 7 H39.5 M26 11 H40 M26 15 H40 M26.5 19 H39.5" stroke="#8a9094" stroke-width="1.2"/><rect x="28" y="4" width="3" height="16" rx="1.5" fill="#fff" opacity=".6"/>`;
      s += `<path d="M-30 -26 C-34 -30 -34 -34 -30 -36" fill="none" stroke="${LINE}" stroke-width="1.6" opacity=".7"/>`;
    } else {
      s += `<path d="M-15 4 C-10 18 4 22 15 20" fill="none" stroke="#15120e" stroke-width="2.6"/><ellipse cx="19" cy="20" rx="5.5" ry="4.2" fill="#15120e" stroke="${LINE}" stroke-width="1.8"/><ellipse cx="18" cy="18.8" rx="1.8" ry="1.2" fill="#fff" opacity=".5"/>`;
      s += `<g fill="#f2c14e" stroke="${DK}" stroke-width="1.4"><path d="M34 -28 l2.2 4.6 5 .7 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.7Z"/></g>`;
    }
    return s + `</g>`;
  }
  const LORO = { a: () => parrot('hand'), b: () => parrot('stand'), c: () => parrot('headset') };
  function hippo(acc) {
    const B = '#3a7cb0', H1 = '#7c9cc4', H2 = '#9bb6d8', H0 = '#5d7fa8', PK = '#f2a8a0';
    let s = badge(B) + `<defs><clipPath id="fa-hb"><rect x="-42" y="-38" width="84" height="82" rx="26"/></clipPath></defs><g stroke-linejoin="round" stroke-linecap="round">`;
    s += `<g clip-path="url(#fa-hb)"><path d="M-40 48 C-40 30 -28 22 0 22 C28 22 40 30 40 48Z" fill="${H0}" stroke="${DK}" stroke-width="2.4"/></g>`;
    const RING = { buoy: ['#fbf7ef', '#3a7cb0'], buoypink: ['#f07aa0', '#fff5f0'], duckring: ['#f2c14e', null] }[acc];
    const ringDraw = (front) => {
      const d = front ? 'M33 31 A33 9.5 0 0 1 -33 31' : 'M-33 31 A33 9.5 0 0 1 33 31';
      let r = `<path d="${d}" fill="none" stroke="${DK}" stroke-width="14"/><path d="${d}" fill="none" stroke="${RING[0]}" stroke-width="10"/>`;
      if (RING[1]) r += `<path d="${d}" fill="none" stroke="${RING[1]}" stroke-width="10" stroke-dasharray="10 16" stroke-dashoffset="${front ? 4 : 17}" stroke-linecap="butt"/>`;
      if (front) r += `<path d="M26 35 A33 9.5 0 0 1 -26 35" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.2"/>`;
      return r;
    };
    if (RING) s += `<g clip-path="url(#fa-hb)">${ringDraw(false)}</g>`;
    if (acc !== 'spa') s += `<ellipse cx="-18" cy="-27" rx="6" ry="7" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="18" cy="-27" rx="6" ry="7" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="-18" cy="-26" rx="2.8" ry="3.6" fill="${PK}"/><ellipse cx="18" cy="-26" rx="2.8" ry="3.6" fill="${PK}"/>`;
    s += `<ellipse cx="0" cy="-8" rx="23" ry="19" fill="${H1}" stroke="${DK}" stroke-width="2.6"/>`;
    s += `<circle cx="-11" cy="-15" r="7.5" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><circle cx="11" cy="-15" r="7.5" fill="${H1}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="0" cy="-6" rx="20" ry="10" fill="${H1}"/>`;
    s += `<ellipse cx="0" cy="13" rx="31" ry="18" fill="${H2}" stroke="${DK}" stroke-width="2.6"/>`;
    s += `<ellipse cx="-11" cy="5" rx="3.6" ry="2.6" fill="#2b3a52"/><ellipse cx="11" cy="5" rx="3.6" ry="2.6" fill="#2b3a52"/>`;
    s += `<circle cx="-24" cy="14" r="4.5" fill="${PK}" opacity=".6"/><circle cx="24" cy="14" r="4.5" fill="${PK}" opacity=".6"/>`;
    s += `<path d="M-17 16 Q0 27 17 16" fill="none" stroke="${DK}" stroke-width="2.2"/><path d="M-7 20.5 v3.2 h4 v-2.2 M3 21.5 v2.2 h4 v-3.2" fill="#fff" stroke="${DK}" stroke-width="1.4"/>`;
    s += `<path d="M-14 -24 Q-10 -26 -6 -24" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>`;
    const eye = (cx) => `<path d="M${cx - 4.6} -15 Q${cx} -9.5 ${cx + 4.6} -15Z" fill="#fff" stroke="${DK}" stroke-width="1.3"/><circle cx="${cx + .6}" cy="-13.4" r="1.8" fill="#15120e"/><path d="M${cx - 5.4} -15.3 H${cx + 5.4}" stroke="${DK}" stroke-width="2.4"/>`;
    if (acc === 'spa') {
      s += `<path d="M-25 -16 C-30 -34 -10 -42 2 -38 C14 -42 32 -32 25 -16 C14 -22 -14 -22 -25 -16Z" fill="#fbe3e6" stroke="${DK}" stroke-width="2.4"/><path d="M-18 -22 C-10 -34 8 -34 16 -24 M-4 -38 C-8 -30 -6 -24 0 -21" fill="none" stroke="#e8b8c0" stroke-width="2"/><path d="M14 -38 C22 -46 32 -42 28 -34 C24 -30 18 -32 14 -38Z" fill="#fbe3e6" stroke="${DK}" stroke-width="2.2"/>`;
      for (const cx of [-11, 11]) s += `<circle cx="${cx}" cy="-14" r="6.4" fill="#7fbf4a" stroke="#2f6a1e" stroke-width="1.8"/><circle cx="${cx}" cy="-14" r="4.4" fill="#d8efb0"/><g fill="#a6cf6e"><circle cx="${cx - 1.6}" cy="-15" r=".9"/><circle cx="${cx + 1.6}" cy="-15" r=".9"/><circle cx="${cx}" cy="-12.4" r=".9"/></g>`;
    } else s += eye(-11) + eye(11);
    if (acc === 'duck') {
      s += `<g transform="translate(4 -33)"><ellipse cx="0" cy="4" rx="12" ry="7.5" fill="#f2c14e" stroke="${DK}" stroke-width="2.2"/><path d="M-10 2 Q-16 -2 -14 -6 Q-10 -2 -6 0Z" fill="#f2c14e" stroke="${DK}" stroke-width="2"/><circle cx="6" cy="-4" r="6.5" fill="#f2c14e" stroke="${DK}" stroke-width="2.2"/><path d="M11 -4.5 Q17 -4 17 -1 Q14 0 10.5 -1.2Z" fill="#f08a3a" stroke="${DK}" stroke-width="1.6"/><circle cx="7.2" cy="-5.5" r="1.4" fill="#15120e"/><path d="M-4 4 Q0 7 4 4" fill="none" stroke="#d39a2a" stroke-width="1.6"/></g>`;
      s += `<g fill="#bfe3f2" stroke="${DK}" stroke-width="1.2"><path d="M-32 -24 q3 4 0 6 q-3 -2 0 -6Z"/><path d="M33 -14 q3 4 0 6 q-3 -2 0 -6Z"/></g>`;
    } else if (acc === 'buoy' || acc === 'buoypink' || acc === 'duckring') {
      const water = `<path d="M-44 41 Q-37 37 -30 41 T-16 41 T-2 41 T12 41 T26 41 T40 41 T54 41 V50 H-44Z" fill="#8fd0ea" opacity=".85"/><path d="M-44 41 Q-37 37 -30 41 T-16 41 T-2 41 T12 41 T26 41 T40 41 T54 41" fill="none" stroke="#fff" stroke-width="1.8" opacity=".8"/>`;
      const hand = (x) => `<ellipse cx="${x}" cy="36" rx="7.5" ry="5.5" fill="${H1}" stroke="${DK}" stroke-width="2.2"/><path d="M${x - 2.6} 37.5 v2.6 M${x + 2.6} 37.5 v2.6" stroke="${DK}" stroke-width="1.4"/>`;
      s += `<g clip-path="url(#fa-hb)">${water}${ringDraw(true)}`;
      if (acc === 'buoy' || acc === 'buoypink') s += `<path d="M-31 27 Q-20 22 -8 23 M8 23 Q20 22 31 27" fill="none" stroke="#e8dcc0" stroke-width="1.6" stroke-dasharray="3 2"/>`;
      s += hand(-15) + hand(15) + `</g>`;
      if (acc === 'duckring') s += `<g transform="translate(29 26)"><path d="M-4 8 C-6 0 -4 -6 2 -8 C8 -10 12 -6 12 0 C12 4 8 8 4 9Z" fill="#f2c14e" stroke="${DK}" stroke-width="2.2"/><path d="M10 -3 Q17 -3 17 0 Q14 2 10.5 1Z" fill="#f08a3a" stroke="${DK}" stroke-width="1.6"/><circle cx="6.5" cy="-3.5" r="1.5" fill="#15120e"/><circle cx="3" cy="1" r="2.4" fill="${PK}" opacity=".6"/></g><path d="M-34 27 Q-42 22 -40 18 Q-36 22 -32 23Z" fill="#f2c14e" stroke="${DK}" stroke-width="2"/>`;
    } else if (acc === 'armbands') {
      s += `<g clip-path="url(#fa-hb)"><path d="M-44 41 Q-37 37 -30 41 T-16 41 T-2 41 T12 41 T26 41 T40 41 T54 41 V50 H-44Z" fill="#8fd0ea" opacity=".85"/><path d="M-44 41 Q-37 37 -30 41 T-16 41 T-2 41 T12 41 T26 41 T40 41 T54 41" fill="none" stroke="#fff" stroke-width="1.8" opacity=".8"/></g>`;
      for (const sd of [-1, 1]) {
        const x = sd * 31, arm = `M${sd * 22} 30 C${sd * 28} 26 ${sd * 34} 22 ${sd * 36} 14`;
        s += `<path d="${arm}" fill="none" stroke="${DK}" stroke-width="12"/><path d="${arm}" fill="none" stroke="${H0}" stroke-width="8"/>`;
        s += `<g transform="rotate(${sd * 28} ${x} 22)"><rect x="${x - 8}" y="14" width="16" height="15" rx="7" fill="#f28a3a" stroke="${DK}" stroke-width="2.2"/><path d="M${x - 7.6} 21.5 H${x + 7.6}" stroke="#fff" stroke-width="2.4"/><rect x="${x - 4}" y="16" width="3" height="4" rx="1" fill="#fff" opacity=".8"/></g>`;
        s += `<ellipse cx="${sd * 36.5}" cy="11" rx="5.5" ry="5" fill="${H1}" stroke="${DK}" stroke-width="2.2"/>`;
      }
    } else if (acc === 'float') {
      s += `<g clip-path="url(#fa-hb)"><ellipse cx="0" cy="34" rx="38" ry="11" fill="#f07aa0" stroke="${DK}" stroke-width="2.4"/><ellipse cx="0" cy="31" rx="22" ry="4" fill="#d24f7c"/>`;
      s += `<path d="M-28 30 Q-20 27 -12 29" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.2"/>`;
      s += [[-26, 37, '#fff3a8', 20], [-14, 40, '#7fd0e8', -30], [-2, 41, '#fff', 10], [12, 40, '#a6e07a', 40], [24, 37, '#fff3a8', -15], [32, 33, '#7fd0e8', 30], [-33, 32, '#fff', -40]].map(([x, y, c, r]) => `<rect x="${x - 2.2}" y="${y - .9}" width="4.4" height="1.8" rx=".9" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('') + `</g>`;
    }
    return s + `</g>`;
  }
  const HIPO = { a: () => hippo('duck'), b: () => hippo('spa'), c: () => hippo('float'), d: () => hippo('buoy'), e: () => hippo('duckring'), f: () => hippo('armbands'), g: () => hippo('buoypink') };
  function frog(acc) {
    const G = '#2e8b57', F1 = '#7cc242', F0 = '#5aa232', FB = '#e6efa0';
    let s = badge(G) + `<defs><clipPath id="fa-fb"><rect x="-42" y="-38" width="84" height="82" rx="26"/></clipPath></defs><g stroke-linejoin="round" stroke-linecap="round">`;
    s += `<g clip-path="url(#fa-fb)"><path d="M-38 48 C-38 30 -26 24 0 24 C26 24 38 30 38 48Z" fill="${F0}" stroke="${DK}" stroke-width="2.4"/><ellipse cx="0" cy="44" rx="20" ry="12" fill="${FB}" stroke="${DK}" stroke-width="2"/></g>`;
    if (acc === 'leaf') s += `<path d="M27 32 L29 -24" stroke="#4a6a1e" stroke-width="3"/>`;
    s += `<circle cx="-16" cy="-15" r="11.5" fill="${F1}" stroke="${DK}" stroke-width="2.6"/><circle cx="16" cy="-15" r="11.5" fill="${F1}" stroke="${DK}" stroke-width="2.6"/>`;
    s += `<ellipse cx="0" cy="5" rx="34" ry="21" fill="${F1}" stroke="${DK}" stroke-width="2.6"/><ellipse cx="0" cy="-6" rx="26" ry="10" fill="${F1}"/>`;
    s += `<path d="M-22 14 Q0 30 22 14 Q0 24 -22 14Z" fill="${FB}" opacity=".7"/>`;
    s += [[-8, -2, 2.2], [9, -4, 1.8], [-24, 4, 1.6], [24, 6, 2], [2, -9, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${F0}"/>`).join('');
    const px = acc === 'fly' ? 2 : 0.6;
    for (const cx of [-16, 16]) s += `<circle cx="${cx}" cy="-15" r="7.6" fill="#f2e27a" stroke="${DK}" stroke-width="1.4"/><ellipse cx="${cx + px}" cy="-13.4" rx="3.6" ry="2.2" fill="#15120e"/><circle cx="${cx + px + 1.2}" cy="-14.2" r=".8" fill="#fff"/><path d="M${cx - 8} -15 A8 8 0 0 1 ${cx + 8} -15Z" fill="${F1}"/><path d="M${cx - 8.6} -15 H${cx + 8.6}" stroke="${DK}" stroke-width="2.4"/>`;
    s += `<circle cx="-4" cy="2" r="1.2" fill="${DK}"/><circle cx="4" cy="2" r="1.2" fill="${DK}"/><circle cx="-25" cy="11" r="4.5" fill="#f08a6a" opacity=".5"/><circle cx="25" cy="11" r="4.5" fill="#f08a6a" opacity=".5"/>`;
    s += `<path d="M-24 9 Q-2 22 22 9" fill="none" stroke="${DK}" stroke-width="2.4"/><path d="M-25 7.5 l2.4 3 M24 7.5 l-2.4 3" stroke="${DK}" stroke-width="2"/>`;
    const hand = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-6 0 Q0 -6 6 0" fill="${F1}" stroke="${DK}" stroke-width="2.2"/><circle cx="-6" cy="1" r="2.6" fill="${F1}" stroke="${DK}" stroke-width="1.8"/><circle cx="0" cy="-1.5" r="2.6" fill="${F1}" stroke="${DK}" stroke-width="1.8"/><circle cx="6" cy="1" r="2.6" fill="${F1}" stroke="${DK}" stroke-width="1.8"/></g>`;
    if (acc === 'crown') {
      s += hand(-18, 34) + hand(18, 34);
      s += `<g transform="rotate(-8 0 -27)"><path d="M-12 -21 L-14 -34 L-6 -27 L0 -37 L6 -27 L14 -34 L12 -21Z" fill="#f2c14e" stroke="${DK}" stroke-width="2.2"/><path d="M-12 -24 H12" stroke="#c98a1e" stroke-width="1.6"/><circle cx="0" cy="-26.5" r="2.2" fill="#c8452d" stroke="${DK}" stroke-width="1"/><circle cx="-14" cy="-34" r="1.8" fill="#fff3a8" stroke="${DK}" stroke-width="1"/><circle cx="0" cy="-37" r="1.8" fill="#fff3a8" stroke="${DK}" stroke-width="1"/><circle cx="14" cy="-34" r="1.8" fill="#fff3a8" stroke="${DK}" stroke-width="1"/><path d="M-9 -30 L-8 -26" stroke="#fff" stroke-width="1.4" opacity=".7"/></g>`;
    } else if (acc === 'leaf') {
      s += hand(-18, 34) + `<g transform="translate(27 30) rotate(-10)"><circle cx="0" cy="0" r="5.5" fill="${F1}" stroke="${DK}" stroke-width="2"/></g>`;
      s += `<path d="M2 -26 C6 -44 50 -50 54 -26 C46 -30 42 -24 38 -28 C34 -22 28 -26 26 -24 C22 -28 16 -22 12 -27 C8 -24 4 -28 2 -26Z" fill="#3f9a3a" stroke="${DK}" stroke-width="2.4"/><path d="M28 -44 L28 -26 M28 -40 L16 -30 M28 -40 L42 -30 M28 -34 L10 -27 M28 -34 L48 -28" fill="none" stroke="#24601f" stroke-width="1.5"/><path d="M14 -38 C20 -44 30 -46 38 -44" fill="none" stroke="#fff" stroke-width="1.8" opacity=".35"/>`;
      s += `<g fill="#8fd0ea" stroke="${DK}" stroke-width="1"><path d="M-30 -32 q2.6 3.6 0 5.4 q-2.6 -1.8 0 -5.4Z"/><path d="M-36 -14 q2.6 3.6 0 5.4 q-2.6 -1.8 0 -5.4Z"/><path d="M-6 -36 q2.4 3.4 0 5 q-2.4 -1.6 0 -5Z"/></g>`;
    } else if (acc === 'fly') {
      s += hand(-18, 34) + hand(18, 34);
      s += `<path d="M18 12 C30 14 38 4 36 -12" fill="none" stroke="${DK}" stroke-width="6.5"/><path d="M18 12 C30 14 38 4 36 -12" fill="none" stroke="#f07a8a" stroke-width="3.8"/><circle cx="36" cy="-13" r="3.6" fill="#f07a8a" stroke="${DK}" stroke-width="1.6"/>`;
      s += `<g transform="translate(35 -20) rotate(20)"><ellipse cx="-4" cy="-5" rx="5" ry="3.2" fill="#e8f4ff" fill-opacity=".85" stroke="${DK}" stroke-width="1.2" transform="rotate(-30 -4 -5)"/><ellipse cx="4" cy="-5" rx="5" ry="3.2" fill="#e8f4ff" fill-opacity=".85" stroke="${DK}" stroke-width="1.2" transform="rotate(30 4 -5)"/><ellipse rx="3.6" ry="4.6" fill="#2b2a30" stroke="${DK}" stroke-width="1"/><circle cx="-1.4" cy="-3" r="1.1" fill="#c8452d"/><circle cx="1.4" cy="-3" r="1.1" fill="#c8452d"/></g>`;
      s += `<path d="M42 -30 l3 -3 M46 -24 l4 -1 M28 -30 l-2 -4" stroke="${LINE}" stroke-width="1.6" opacity=".8"/>`;
    }
    return s + `</g>`;
  }
  const RANA = { a: () => frog('crown'), b: () => frog('leaf'), c: () => frog('fly') };
  const ANIMALS = { jaguar: JAGUAR, tucan: TUCAN, loro: LORO, hipo: HIPO, rana: RANA };

  function plank(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" style="display:block;width:100%;height:auto"><rect x="3" y="2.5" width="114" height="35" rx="6" fill="#c99a62" stroke="#74491f" stroke-width="1.5"/><path d="M6 12 C40 14 80 10 114 13 M6 26 C40 28 80 24 114 27" stroke="#9e6d3b" stroke-width="1" fill="none" opacity=".7"/><circle cx="11" cy="20" r="1.9" fill="#74491f"/><circle cx="109" cy="20" r="1.9" fill="#74491f"/><g transform="translate(60 19.5) scale(.36)">${inner}</g></svg>`;
  }
  window.fichaAnimalInner = (a, v) => { const A = ANIMALS[a] || JAGUAR; return (A[v] || A.a)(); };
  class FichaAnimal extends HTMLElement {
    static get observedAttributes() { return ['animal', 'variant', 'context']; }
    connectedCallback() { if (!this.style.display) this.style.display = 'block'; this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const A = ANIMALS[this.getAttribute('animal') || 'jaguar'] || JAGUAR;
      const inner = (A[this.getAttribute('variant') || 'a'] || A.a)();
      this.innerHTML = this.getAttribute('context') === 'tablon' ? plank(inner)
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-52 -52 104 104" style="display:block;width:100%;height:100%;overflow:visible">${inner}</svg>`;
    }
  }
  if (!customElements.get('ficha-animal')) customElements.define('ficha-animal', FichaAnimal);
})();
