(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Tech stack marquee */
  const row1 = ["Node.js","Express.js","FastAPI","Python","JavaScript","C++","SQL","MySQL","PostgreSQL","MongoDB","Redis","RabbitMQ","Socket.IO"];
  const row2 = ["LangChain","LangGraph","RAG","XGBoost","TensorFlow","Scikit-learn","React","Docker","AWS EC2","Jenkins","GitHub Actions","Prometheus","Grafana","Linux"];
  const fill = (id, list) => { const t = document.getElementById(id); if (t) t.innerHTML = [...list, ...list].map(s => `<span>${s}</span>`).join(""); };
  fill("r1", row1); fill("r2", row2);

  /* One continuous background for the whole page: drifting network + colour that shifts as you scroll */
  const c = document.getElementById("bgfx"), x = c.getContext("2d");
  const PU = [139, 92, 246], TE = [20, 211, 176], PK = [236, 72, 153], TAU = 6.283;
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const tint = p => p < .5 ? mix(PU, TE, p * 2) : mix(TE, PK, (p - .5) * 2);
  let W, H, ps = [], sy = 0, sp = 0; const m = { x: -999, y: -999 };

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    ps = Array.from({ length: Math.round(Math.min(100, W * H / 15000)) }, () => ({
      x: Math.random() * W, y: Math.random() * (H + 80), vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      z: .3 + Math.random() * .7, r: Math.random() * 1.5 + .7
    }));
    draw(0);
  }

  function draw(t) {
    x.clearRect(0, 0, W, H);
    const A = tint(sp), B = tint(Math.min(1, sp + .3));
    [[.85, .25, .6, A, .2], [.1, .8, .5, B, .15], [.6, 1.05, .45, PU, .1]].forEach(([ox, oy, rr, col, a], i) => {
      const cx = W * ox + Math.sin(t / 4000 + i * 2) * 40, cy = H * oy + Math.cos(t / 5000 + i) * 30, r = Math.max(W, H) * rr;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    });
    const span = H + 80, pos = ps.map(p => {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      let px = p.x, py = (((p.y - sy * p.z * .3) % span) + span) % span - 40;
      const dx = px - m.x, dy = py - m.y, d = Math.hypot(dx, dy);
      if (d < 130 && d > 0) { px += dx / d * 14 * (1 - d / 130); py += dy / d * 14 * (1 - d / 130); }
      return { px, py, p };
    });
    const rgb = A.join(",");
    for (let i = 0; i < pos.length; i++) {
      const a = pos[i];
      x.fillStyle = `rgba(${rgb},${.35 + a.p.z * .5})`;
      x.beginPath(); x.arc(a.px, a.py, a.p.r * a.p.z + .5, 0, TAU); x.fill();
      for (let j = i + 1; j < pos.length; j++) {
        const d = Math.hypot(a.px - pos[j].px, a.py - pos[j].py);
        if (d < 120) { x.strokeStyle = `rgba(${rgb},${(1 - d / 120) * .4})`; x.beginPath(); x.moveTo(a.px, a.py); x.lineTo(pos[j].px, pos[j].py); x.stroke(); }
      }
      const dm = Math.hypot(a.px - m.x, a.py - m.y);
      if (dm < 170) { x.strokeStyle = `rgba(20,211,176,${(1 - dm / 170) * .7})`; x.beginPath(); x.moveTo(a.px, a.py); x.lineTo(m.x, m.y); x.stroke(); }
    }
  }
  const loop = t => { draw(t); requestAnimationFrame(loop); };
  const move = e => { const t = e.touches ? e.touches[0] : e; m.x = t.clientX; m.y = t.clientY; };
  addEventListener("mousemove", move);
  addEventListener("touchmove", move, { passive: true });
  document.addEventListener("mouseleave", () => { m.x = m.y = -999; });
  addEventListener("resize", size);
  size();
  if (!reduce) requestAnimationFrame(loop);

  /* Scroll progress bar, active menu link, background colour shift */
  const prog = document.getElementById("prog");
  const secs = [...document.querySelectorAll("main section[id]")], links = [...document.querySelectorAll(".links a")];
  let ticking = false;
  function onScroll() {
    sy = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    sp = max > 0 ? Math.min(1, sy / max) : 0;
    prog.style.transform = `scaleX(${sp})`;
    let cur = "top";
    for (const s of secs) if (s.getBoundingClientRect().top <= 170) cur = s.id;
    if (max - sy < 40) cur = "contact";
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
    if (reduce) draw(0);
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Content flows in as you scroll */
  if (!reduce && "IntersectionObserver" in window) {
    const items = document.querySelectorAll("section h2, section .card, section .tl > div");
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in"); io.unobserve(en.target);
      setTimeout(() => { en.target.classList.remove("rv", "in"); en.target.style.transitionDelay = ""; }, 1100);
    }), { threshold: .1, rootMargin: "0px 0px -5% 0px" });
    items.forEach(e => {
      e.classList.add("rv");
      e.style.transitionDelay = Math.min([...e.parentElement.children].indexOf(e), 5) * 70 + "ms";
      io.observe(e);
    });
  }
})();
