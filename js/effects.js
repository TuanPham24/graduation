// Showpiece effects: wax seal cracking, the kid walking the map route, and a
// graduation-cap toss. Exposed as window.FX so main.js can trigger them.
// Everything is skipped (or jumps to its end state) for reduced-motion users.
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Wax seal cracks into shards ----------
  function crackSeal(seal) {
    if (reduced || !seal || !seal.animate) return;
    const r = seal.getBoundingClientRect();
    if (!r.width) return;
    const style = getComputedStyle(seal);
    const layer = document.createElement("div");
    layer.className = "fx-shards";
    layer.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
    document.body.appendChild(layer);

    const pieces = 6;
    const start = Math.random() * 60;
    for (let i = 0; i < pieces; i++) {
      // Wedge from the centre, with a jagged point on each crack line.
      const a0 = ((start + (i * 360) / pieces) * Math.PI) / 180;
      const a1 = ((start + ((i + 1) * 360) / pieces) * Math.PI) / 180;
      const am = (a0 + a1) / 2;
      const pt = (a, d) => `${50 + d * Math.cos(a)}% ${50 + d * Math.sin(a)}%`;
      const jag = 24 + Math.random() * 10;
      const shard = document.createElement("span");
      shard.className = "fx-shard";
      shard.style.background = style.backgroundImage;
      shard.style.borderRadius = style.borderRadius;
      shard.style.clipPath = `polygon(50% 50%, ${pt(a0 + 0.12, jag)}, ${pt(a0, 75)}, ${pt(am, 80)}, ${pt(a1, 75)}, ${pt(a1 - 0.1, jag)})`;
      layer.appendChild(shard);

      const dist = 30 + Math.random() * 40;
      const dx = Math.cos(am) * dist;
      const dy = Math.sin(am) * dist;
      const spin = (Math.random() - 0.5) * 220;
      shard.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy - 16}px) rotate(${spin * 0.4}deg)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${dx * 1.25}px, ${dy + 60}px) rotate(${spin * 0.75}deg)`, opacity: 1, offset: 0.7 },
          { transform: `translate(${dx * 1.4}px, ${dy + 140}px) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 300, easing: "cubic-bezier(.25,.6,.45,1)", fill: "forwards" }
      );
    }
    setTimeout(() => layer.remove(), 1600);
  }

  // ---------- 3. Kid walks the route on the map, then the pin drops ----------
  function setupMapWalk() {
    const card = document.querySelector(".map-card");
    const route = card && card.querySelector(".m-route");
    const walker = document.getElementById("mapWalker");
    const pin = card && card.querySelector(".m-pin");
    if (!route || !walker || !pin || !route.getTotalLength) return;

    const total = route.getTotalLength();
    const place = (t) => {
      const p = route.getPointAtLength(total * t);
      // The campus group is rotated 11°, so counter-rotate to keep the kid upright.
      walker.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(-11) scale(1.5)`);
    };
    const arrive = () => {
      walker.classList.remove("walking");
      walker.classList.add("arrived");
      pin.classList.remove("wait");
      pin.classList.add("drop");
    };

    if (reduced) {
      place(1);
      walker.style.opacity = 1;
      return;
    }

    pin.classList.add("wait");
    place(0);
    let running = false;
    function walk() {
      if (running) return;
      running = true;
      pin.classList.remove("drop");
      pin.classList.add("wait");
      walker.classList.remove("arrived");
      walker.classList.add("walking");
      walker.style.opacity = 1;
      const dur = 5200;
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      (function frame(now) {
        const t = Math.min(1, (now - t0) / dur);
        place(ease(t));
        if (t < 1) requestAnimationFrame(frame);
        else {
          running = false;
          arrive();
        }
      })(t0);
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io.disconnect();
            setTimeout(walk, 500);
          }
        },
        { threshold: 0.55 }
      );
      io.observe(card);
    } else {
      walk();
    }
    // Tap the map to watch the walk again.
    card.addEventListener("click", walk);
    card.style.cursor = "pointer";
  }

  // ---------- 4. Graduation-cap toss ----------
  const COLORS = ["#2b3f7a", "#5f8fd0", "#a9c9ec", "#e0ad45", "#c4473a", "#1d2230"];
  let tossing = false;

  function capToss() {
    if (reduced || tossing) return;
    tossing = true;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-confetti";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const small = W < 600;
    const count = small ? 42 : 70;
    const parts = [];
    for (let i = 0; i < count; i++) {
      const kind = i % 3 === 0 ? "cap" : i % 3 === 1 ? "star" : "bit";
      parts.push({
        kind,
        x: W * (0.2 + Math.random() * 0.6),
        y: H + 20,
        vx: (Math.random() - 0.5) * (small ? 7 : 11),
        vy: -(H / 30) * (0.75 + Math.random() * 0.3),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        size: kind === "cap" ? 16 + Math.random() * 8 : kind === "star" ? 7 + Math.random() * 5 : 5 + Math.random() * 4,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        delay: Math.random() * 260,
        sway: Math.random() * Math.PI * 2,
      });
    }

    function drawCap(p) {
      const s = p.size;
      // mortarboard: a flat diamond on top of a small skull cap, gold tassel
      ctx.fillStyle = "#1d2230";
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, 0);
      ctx.lineTo(s * 0.3, 0);
      ctx.lineTo(s * 0.26, s * 0.32);
      ctx.lineTo(-s * 0.26, s * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2b3f7a";
      ctx.strokeStyle = "#1d2230";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.34);
      ctx.lineTo(s * 0.62, -s * 0.06);
      ctx.lineTo(0, s * 0.18);
      ctx.lineTo(-s * 0.62, -s * 0.06);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#e0ad45";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.08);
      ctx.lineTo(s * 0.42, s * 0.02);
      ctx.lineTo(s * 0.44, s * 0.42);
      ctx.stroke();
      ctx.fillStyle = "#e0ad45";
      ctx.fillRect(s * 0.4, s * 0.38, 3, 5);
    }
    function drawStar(p) {
      const s = p.size;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const d = i % 2 === 0 ? s : s * 0.32;
        ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d);
      }
      ctx.closePath();
      ctx.fill();
    }
    function drawBit(p) {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }

    const t0 = performance.now();
    const gravity = H / 3600;
    (function frame(now) {
      const elapsed = now - t0;
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        if (elapsed < p.delay) {
          alive++;
          continue;
        }
        p.vy += gravity;
        p.vx *= 0.99;
        p.vy *= p.vy < 0 ? 0.985 : 0.965; // floatier on the way down
        p.sway += 0.06;
        p.x += p.vx + (p.vy > 0 ? Math.sin(p.sway) * 0.8 : 0);
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 40 && p.vy > 0) continue;
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, (6000 - elapsed) / 900));
        if (p.kind === "cap") drawCap(p);
        else if (p.kind === "star") drawStar(p);
        else drawBit(p);
        ctx.restore();
      }
      if (alive && elapsed < 6000) requestAnimationFrame(frame);
      else {
        canvas.remove();
        tossing = false;
      }
    })(t0);
  }

  // Toss caps the first time the guest reaches the Thank you section.
  function setupThanksToss() {
    const section = document.getElementById("thanks");
    if (!section || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          setTimeout(capToss, 400);
        }
      },
      { threshold: 0.45 }
    );
    io.observe(section);
  }

  setupMapWalk();
  setupThanksToss();
  window.FX = { crackSeal, capToss };
})();
