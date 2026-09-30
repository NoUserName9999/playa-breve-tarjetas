const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const font = f => 'data:font/woff2;base64,' + fs.readFileSync(require.resolve('@fontsource/' + f)).toString('base64');
const anton = font('anton/files/anton-latin-400-normal.woff2'), inter8 = font('inter/files/inter-latin-800-normal.woff2'), inter5 = font('inter/files/inter-latin-500-normal.woff2');
const logo='data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'logo.png')).toString('base64');
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const hl = s => esc(s).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');
const html = c => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(${anton})}@font-face{font-family:Inter;font-weight:800;src:url(${inter8})}@font-face{font-family:Inter;font-weight:500;src:url(${inter5})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;background:#111418;color:#F5F1E8;font-family:Inter;position:relative;overflow:hidden}
.glow{position:absolute;right:-200px;top:-200px;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(255,206,31,.18),transparent 65%)}
.top{position:absolute;top:52px;left:72px;right:72px;display:flex;justify-content:space-between;align-items:center}
.brand{font-family:Anton;font-size:40px;letter-spacing:1px;display:flex;align-items:center;gap:20px}.brand img{width:92px;height:92px;border-radius:50%}.brand b{color:#FFCE1F;font-weight:400}
.tag{border:3px solid #FFCE1F;color:#FFCE1F;font-weight:800;font-size:26px;letter-spacing:3px;padding:12px 22px;border-radius:8px}
.main{position:absolute;left:72px;right:72px;top:210px;bottom:220px;display:flex;flex-direction:column;justify-content:center;gap:40px}
.big{font-family:Anton;font-size:${c.bigSize||260}px;line-height:.9;color:#FFCE1F}
h1{font-family:Anton;font-weight:400;font-size:${c.titleSize||104}px;line-height:1.14;text-transform:uppercase}.hl{color:#FFCE1F}
.sub{font-weight:500;font-size:40px;line-height:1.35;color:#D9D4C7}.sub b{font-weight:800;color:#F5F1E8}
.foot{position:absolute;left:72px;right:72px;bottom:64px;border-top:3px solid #2B3038;padding-top:28px;display:flex;justify-content:space-between;font-size:26px;color:#9AA1AC;font-weight:500}.foot b{color:#F5F1E8;font-weight:800}
</style></head><body><div class="top"><div class="brand"><img src="${logo}">PLAYA BREVE</div><div class="tag">${esc(c.tag)}</div></div>
<div class="main">${c.big?`<div class="big">${esc(c.big)}</div>`:''}<h1>${hl(c.title)}</h1>${c.sub?`<p class="sub">${c.sub}</p>`:''}</div>
<div class="foot"><span>Fuente: <b>${esc(c.source)}</b></span><span>${esc(c.date)}</span></div></body></html>`;
(async () => {
  const cards = JSON.parse(fs.readFileSync(process.argv[2] || 'cards.json', 'utf8')); const out = process.argv[3] || 'out'; fs.mkdirSync(out, { recursive: true });
  const exe = ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(x => fs.existsSync(x) && fs.statSync(x).isFile());
  const b = await chromium.launch(exe ? { executablePath: exe } : {}); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const c of cards) {
    for (let i = 0; i < 12; i++) { await p.setContent(html(c)); await p.evaluate(() => document.fonts.ready);
      const over = await p.evaluate(() => { const m = document.querySelector('.main'); return m.scrollHeight > m.clientHeight + 2; });
      if (!over) break; c.titleSize = Math.round((c.titleSize || 104) * .93); c.bigSize = Math.round((c.bigSize || 260) * .93); }
    await p.screenshot({ path: path.join(out, c.file + '.png') }); console.log('ok', c.file);
  }
  await b.close();
})();
