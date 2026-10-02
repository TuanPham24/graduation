(function () {
  "use strict";

  const C = window.GRAD_CONFIG || {};
  const ev = C.event || {};
  const $ = (id) => document.getElementById(id);
  const TBA = "Sắp công bố";
  const DEMO = !C.appsScriptUrl;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let buddy = null;

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  function setText(id, value, fallback) {
    const el = $(id);
    if (!el) return;
    if (value) { el.textContent = value; el.classList.remove("tba"); }
    else if (fallback !== undefined) { el.textContent = fallback; el.classList.add("tba"); }
    else el.hidden = true;
  }

  function getRecipient() {
    const to = new URLSearchParams(location.search).get("to");
    return to ? to.trim().slice(0, 40) : "";
  }

  // ---------- Fill content ----------
  function fillContent() {
    setText("graduateName", C.graduateName);
    setText("major", C.major);
    setText("school", C.school);
    if (!C.major || !C.school) $("majorDot").hidden = true;
    setText("classOf", C.classOf, "");
    setText("footerName", C.graduateName || "mình");
    setText("stampYear", C.classOf, "");
    if (C.graduateName) document.title = `Lễ tốt nghiệp của ${C.graduateName}`;

    if (C.photo) {
      const img = $("heroPhoto");
      img.src = C.photo;
      img.alt = C.graduateName || "Ảnh tốt nghiệp";
      img.hidden = false;
      img.parentElement.classList.add("has-photo");
    }

    const L = C.letter || {};
    setText("signOff", L.signOff);
    setText("signature", C.graduateName);

    setText("eventDate", ev.displayDate, TBA);
    setText("eventTime", ev.displayTime);
    setText("venueName", ev.venueName, TBA);
    setText("venueAddress", ev.venueAddress);
    if (ev.mapUrl && /^https?:\/\//i.test(ev.mapUrl)) {
      $("mapLink").href = ev.mapUrl;
      $("mapLink").hidden = false;
    }
    if (ev.dressCode) setText("dressCode", ev.dressCode);
    else $("dressCard").hidden = true;

    if (C.rsvpDeadline) $("rsvpSub").textContent = `Bạn báo cho mình trước ngày ${C.rsvpDeadline} nhé`;
  }

  // ---------- Personal letter ----------
  const normalize = (s) =>
    String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().trim().replace(/\s+/g, " ");

  function findPersonalNote(name) {
    const notes = (C.letter && C.letter.personalNotes) || {};
    const key = normalize(name);
    const match = Object.keys(notes).find((k) => normalize(k) === key);
    return match ? notes[match] : "";
  }

  let guestName = "";

  function applyGuest(name) {
    guestName = name;
    const L = C.letter || {};
    const shown = name || L.defaultRecipient || "bạn";
    $("recipient").textContent = shown;
    $("envTo").textContent = shown;
    $("heroHello").textContent = name ? `Xin chào, ${name}!` : "";

    const body = $("letterBody");
    body.textContent = "";
    (L.paragraphs || []).forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text.split("{name}").join(shown);
      body.appendChild(p);
    });
    const ps = name && findPersonalNote(name);
    if (ps) {
      const p = document.createElement("p");
      p.className = "letter-ps";
      p.textContent = `P.S. ${ps}`;
      body.appendChild(p);
    }

    if (name) {
      $("rsvpName").value = name;
      $("wishName").value = name;
    }
  }

  // ---------- Name gate ----------
  function setupGate(onEnter) {
    const gate = $("gate");
    const form = $("gateForm");
    const input = $("gateName");
    const err = $("gateError");

    const open = () => {
      input.value = guestName || store.get("guestName") || getRecipient();
      gate.classList.remove("leaving");
      gate.hidden = false;
      document.body.classList.add("gated");
      setTimeout(() => input.focus(), 300);
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = input.value.trim().replace(/\s+/g, " ").slice(0, 40)
        .split(" ").map((w) => w.charAt(0).toLocaleUpperCase("vi") + w.slice(1)).join(" ");
      if (!name) {
        err.textContent = "Bạn nhập tên giúp mình nhé!";
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
        return;
      }
      err.textContent = "";
      store.set("guestName", name);
      applyGuest(name);
      gate.classList.add("leaving");
      document.body.classList.remove("gated");
      setTimeout(() => { gate.hidden = true; }, 800);
      onEnter(name);
    });

    $("changeName").addEventListener("click", open);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    open();
  }

  // ---------- Hero title letter animation ----------
  function splitTitle() {
    const el = $("heroTitle");
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "ch";
      span.setAttribute("aria-hidden", "true");
      span.textContent = ch === " " ? " " : ch;
      span.style.animationDelay = `${0.3 + i * 0.05}s`;
      el.appendChild(span);
    });
  }

  function makeStars() {
    const box = document.querySelector(".stars");
    const count = window.innerWidth < 600 ? 10 : 20;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDelay = `${Math.random() * 3}s`;
      const size = 6 + Math.random() * 10;
      s.style.width = s.style.height = `${size}px`;
      box.appendChild(s);
    }
  }

  // ---------- Reveal on scroll ----------
  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    // Pause the hero's looping animations once it's scrolled out of view.
    const hero = document.querySelector(".hero");
    new IntersectionObserver(([e]) => hero.classList.toggle("offscreen", !e.isIntersecting)).observe(hero);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
  }

  // ---------- Confetti ----------
  function celebrate(big) {
    if (typeof window.confetti !== "function") return;
    const colors = ["#ffb5c8", "#c9b6ff", "#aeead0", "#ffe9a3", "#c4e4ff", "#f48fb1"];
    window.confetti({ particleCount: big ? 160 : 90, spread: 90, origin: { y: 0.65 }, colors });
    if (big) {
      setTimeout(() => window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors }), 250);
      setTimeout(() => window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors }), 400);
    }
  }

  // ---------- Envelope ----------
  function setupEnvelope() {
    const env = $("envelope");
    const stage = env.parentElement;
    env.addEventListener("click", () => {
      if (env.classList.contains("open")) return;
      env.classList.add("open");
      setTimeout(() => env.classList.add("gone"), 1100);
      setTimeout(() => {
        stage.classList.add("letter-stage-open");
        celebrate(false);
      }, 1500);
    });
  }

  // ---------- Countdown ----------
  function setupCountdown() {
    const target = ev.dateTime ? new Date(ev.dateTime) : null;
    const msg = $("cdMessage");
    if (!target || isNaN(target)) {
      msg.textContent = "Ngày tổ chức vẫn còn là bí mật — bạn quay lại sau nhé!";
      return;
    }
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        ["cdDays", "cdHours", "cdMins", "cdSecs"].forEach((id) => ($(id).textContent = "00"));
        msg.textContent = diff > -86400000 ? "Chính là hôm nay! Gặp bạn ở đó nhé!" : "Cảm ơn bạn đã cùng mình chung vui!";
        clearInterval(timer);
        return;
      }
      $("cdDays").textContent = Math.floor(diff / 86400000);
      $("cdHours").textContent = pad(Math.floor((diff / 3600000) % 24));
      $("cdMins").textContent = pad(Math.floor((diff / 60000) % 60));
      $("cdSecs").textContent = pad(Math.floor((diff / 1000) % 60));
    };
    const timer = setInterval(tick, 1000);
    tick();
  }

  // ---------- Backend ----------
  async function send(payload) {
    if (DEMO) {
      console.info("[demo mode] would send:", payload);
      await new Promise((r) => setTimeout(r, 600));
      return { ok: true };
    }
    // text/plain avoids a CORS preflight, which Apps Script can't answer.
    const res = await fetch(C.appsScriptUrl, { method: "POST", body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function loadWishes() {
    if (DEMO) {
      return [
        { name: "Bạn demo", message: "Chúc mừng tốt nghiệp! Tự hào về bạn lắm!" },
        { name: "Một người bạn", message: "Cuối cùng cũng ra trường rồi! Hẹn gặp ở buổi lễ nha." },
      ];
    }
    const res = await fetch(C.appsScriptUrl);
    const data = await res.json();
    return data.ok ? data.wishes : [];
  }

  let toastTimer;
  function toast(text) {
    const t = $("toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  function fail(form, errEl, text) {
    errEl.textContent = text;
    form.classList.remove("shake");
    void form.offsetWidth;
    form.classList.add("shake");
  }

  // ---------- RSVP ----------
  function setupRsvp() {
    const form = $("rsvpForm");
    const thanks = $("rsvpThanks");
    const err = $("rsvpError");

    function showThanks(answer) {
      const yes = answer.attending === "yes";
      $("thanksTitle").textContent = yes ? `Yay, hẹn gặp ${answer.name} nhé!` : `Cảm ơn ${answer.name} nhiều!`;
      $("thanksText").textContent = yes
        ? "Mình đã giữ chỗ cho bạn rồi. Mong gặp bạn lắm!"
        : "Tiếc quá, nhưng cảm ơn bạn đã báo cho mình biết nha.";
      form.hidden = true;
      thanks.hidden = false;
    }

    const saved = store.get("rsvp");
    if (saved) showThanks(saved);

    $("rsvpEdit").addEventListener("click", () => {
      thanks.hidden = true;
      form.hidden = false;
      form.classList.add("in");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      const fd = new FormData(form);
      if (fd.get("website")) return;
      const answer = {
        type: "rsvp",
        name: String(fd.get("name") || "").trim(),
        attending: fd.get("attending"),
        note: String(fd.get("note") || "").trim(),
        invitedAs: getRecipient(),
      };
      if (!answer.name) return fail(form, err, "Bạn cho mình biết tên nhé.");

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Đang gửi...";
      try {
        await send(answer);
        if (DEMO) toast("Chế độ demo: chưa kết nối Google Sheet nên câu trả lời chưa được lưu.");
        else store.set("rsvp", answer);
        showThanks(answer);
        celebrate(answer.attending === "yes");
        if (buddy) buddy.react(answer.attending === "yes" ? "Yay! Hẹn gặp bạn nha!" : "Huhu, tiếc ghê...", answer.attending === "yes");
      } catch (ex) {
        console.error(ex);
        fail(form, err, "Ối, có lỗi rồi. Bạn thử lại giúp mình nhé.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Gửi câu trả lời";
      }
    });
  }

  // ---------- Wishes ----------
  function noteEl(w, i) {
    const n = document.createElement("div");
    n.className = `note n${i % 5}`;
    n.style.setProperty("--tilt", `${((i * 37) % 7) - 3}deg`);
    n.style.setProperty("--tape", `${((i * 53) % 9) - 4}deg`);
    n.style.animationDelay = `${Math.min(i, 12) * 0.06}s`;
    const p = document.createElement("p");
    p.textContent = w.message;
    const from = document.createElement("div");
    from.className = "from";
    from.textContent = `— ${w.name}`;
    n.append(p, from);
    return n;
  }

  function setupWishes() {
    const wall = $("wall");
    const empty = $("wallEmpty");
    const form = $("wishForm");
    const err = $("wishError");
    let count = 0;

    loadWishes()
      .then((list) => {
        list.forEach((w) => wall.appendChild(noteEl(w, count++)));
        empty.hidden = count > 0;
      })
      .catch((ex) => {
        console.error(ex);
        empty.hidden = false;
      });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      const fd = new FormData(form);
      if (fd.get("website")) return;
      const wish = {
        type: "wish",
        name: String(fd.get("name") || "").trim(),
        message: String(fd.get("message") || "").trim(),
      };
      if (!wish.name || !wish.message) return fail(form, err, "Bạn điền tên và lời chúc giúp mình nhé.");

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Đang gửi...";
      try {
        await send(wish);
        wall.prepend(noteEl(wish, count++));
        empty.hidden = true;
        form.elements.message.value = "";
        toast(DEMO
          ? "Chế độ demo: chưa kết nối Google Sheet nên lời chúc chưa được lưu."
          : "Lời chúc của bạn đã được ghim lên tường. Cảm ơn bạn!");
        celebrate(false);
        if (buddy) buddy.react("Cảm ơn lời chúc của bạn nhiều lắm!", true);
      } catch (ex) {
        console.error(ex);
        fail(form, err, "Ối, có lỗi rồi. Bạn thử lại giúp mình nhé.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Gửi lời chúc";
      }
    });
  }

  // ---------- Music ----------
  function setupMusic() {
    let player = null;
    if (C.musicUrl) {
      const audio = $("music");
      audio.src = C.musicUrl;
      player = { play: () => audio.play(), pause: () => audio.pause() };
    } else if (C.builtInMusic !== false && window.createMusicBox) {
      player = window.createMusicBox();
    }
    if (!player) return null;

    const btn = $("musicBtn");
    btn.hidden = false;
    let on = false;
    const setOn = (v) => {
      on = v;
      btn.classList.toggle("playing", v);
      btn.setAttribute("aria-label", v ? "Tắt nhạc" : "Bật nhạc");
    };
    const toggle = () => {
      if (on) { player.pause(); setOn(false); return; }
      Promise.resolve(player.play()).then(() => setOn(true)).catch(() => toast("Không phát được nhạc"));
    };
    btn.addEventListener("click", toggle);
    document.addEventListener("visibilitychange", () => {
      if (!on) return;
      if (document.hidden) player.pause();
      else player.play();
    });
    return { start: () => { if (!on) toggle(); } };
  }

  // ---------- Cursor sparkles ----------
  function setupSparkles() {
    if (reduceMotion) return;
    const colors = ["#ffb5c8", "#c9b6ff", "#aeead0", "#ffd36e", "#9fd3ff", "#f48fb1"];
    const shapes = ["s-star", "s-heart", "s-dot"];
    let live = 0;
    let last = 0;

    function spawn(x, y, spread, shape) {
      if (live > 60) return;
      const s = document.createElement("span");
      s.className = `sparkle ${shape || shapes[Math.floor(Math.random() * shapes.length)]}`;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = spread * (0.4 + Math.random() * 0.6);
      s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      s.style.setProperty("--dy", `${Math.sin(angle) * dist + spread * 0.4}px`);
      s.style.setProperty("--k", (0.6 + Math.random() * 0.8).toFixed(2));
      s.style.setProperty("--t", `${0.7 + Math.random() * 0.5}s`);
      live++;
      s.addEventListener("animationend", () => { s.remove(); live--; });
      document.body.appendChild(s);
    }

    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", (e) => {
        const now = performance.now();
        if (now - last < 30) return;
        last = now;
        spawn(e.clientX, e.clientY, 26);
      }, { passive: true });
    }
    window.addEventListener("pointerdown", (e) => {
      for (let i = 0; i < 10; i++) spawn(e.clientX, e.clientY, 70, "s-heart");
    }, { passive: true });
  }

  // ---------- Walking student ----------
  function setupBuddy() {
    const el = $("buddy");
    const bubble = $("buddyBubble");
    const eyes = $("buddyEyes");
    let lastY = window.scrollY;
    let walkTimer, bubbleTimer, jumpTimer, happyTimer;
    let currentSection = "";
    let atEnd = false;

    function say(text, ms = 3800) {
      bubble.textContent = text;
      bubble.classList.add("show");
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove("show"), ms);
    }

    function jump() {
      el.classList.remove("jump");
      void el.offsetWidth;
      el.classList.add("jump");
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(() => el.classList.remove("jump"), 650);
    }

    function react(text, happy) {
      say(text);
      if (!happy) return;
      jump();
      el.classList.add("happy");
      clearTimeout(happyTimer);
      happyTimer = setTimeout(() => el.classList.remove("happy"), 2500);
    }

    // Layout values are cached so scrolling never forces a reflow.
    let maxScroll = 0;
    let track = 0;
    function measure() {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      // keep clear of the music button on the right
      track = Math.max(0, window.innerWidth - el.offsetWidth - 12 - 84);
    }

    function position() {
      const p = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      el.style.transform = `translate3d(${12 + p * track}px, 0, 0)`;
      el.classList.toggle("bubble-right", p > 0.5);
      const end = p > 0.985;
      if (end !== atEnd) {
        atEnd = end;
        el.classList.toggle("cheer", end);
        if (end) say(`Cảm ơn ${guestName || "bạn"} đã xem hết thiệp của mình!`);
      }
    }

    let scrollQueued = false;
    window.addEventListener("scroll", () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        const dy = window.scrollY - lastY;
        lastY = window.scrollY;
        if (dy !== 0 && !reduceMotion) {
          if (!el.classList.contains("walking")) el.classList.add("walking");
          if (el.classList.contains("face-left") !== dy < 0) el.classList.toggle("face-left", dy < 0);
          clearTimeout(walkTimer);
          walkTimer = setTimeout(() => el.classList.remove("walking"), 200);
        }
        position();
      });
    }, { passive: true });
    window.addEventListener("resize", () => { measure(); position(); });
    if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); position(); }).observe(document.body);

    let pointer = null;
    let eyesQueued = false;
    window.addEventListener("pointermove", (e) => {
      pointer = e;
      if (eyesQueued) return;
      eyesQueued = true;
      requestAnimationFrame(() => {
        eyesQueued = false;
        const r = el.getBoundingClientRect();
        const dx = pointer.clientX - (r.left + r.width / 2);
        const dy = pointer.clientY - (r.top + r.height * 0.33);
        const d = Math.hypot(dx, dy) || 1;
        const flip = el.classList.contains("face-left") ? -1 : 1;
        eyes.style.transform = `translate(${(dx / d) * 2.6 * flip}px, ${(dy / d) * 2.2}px)`;
      });
    }, { passive: true });

    const lines = {
      hero: () => `Chào ${guestName || "bạn"}! Kéo xuống xem thiệp nha`,
      letter: () => ($("envelope").classList.contains("open") ? "Thư mình viết đó, đọc hết nha!" : "Bấm vào phong bì đi bạn ơi!"),
      details: () => "Nhớ lưu lại ngày này nhé!",
      rsvp: () => "Bạn xác nhận giúp mình nha!",
      wishes: () => "Viết cho mình vài lời chúc đi!",
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const key = e.target.id || "hero";
        if (key === currentSection) return;
        currentSection = key;
        if (!document.body.classList.contains("gated")) say(lines[key]());
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    [document.querySelector(".hero"), $("letter"), $("details"), $("rsvp"), $("wishes")].forEach((s) => io.observe(s));

    const pokes = ["Hihi, nhột quá!", "Mình tốt nghiệp rồi nè!", "Yay! Cảm ơn bạn đã ghé!", "Nhớ đến dự lễ nha!"];
    let pokeIndex = 0;
    el.addEventListener("click", () => react(pokes[pokeIndex++ % pokes.length], true));

    measure();
    position();
    return {
      react,
      greet(name) {
        currentSection = "hero";
        setTimeout(() => react(`Chào ${name}! Đi xem thiệp với mình nha!`, true), 700);
      },
    };
  }

  fillContent();
  applyGuest("");
  splitTitle();
  makeStars();
  setupReveal();
  setupEnvelope();
  setupCountdown();
  setupRsvp();
  setupWishes();
  const music = setupMusic();
  setupSparkles();
  buddy = setupBuddy();
  setupGate((name) => {
    celebrate(false);
    buddy.greet(name);
    if (music) music.start();
  });
  if (DEMO) console.info("Demo mode: set appsScriptUrl in js/config.js to save responses.");
})();
