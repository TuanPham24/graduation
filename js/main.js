(function () {
  "use strict";

  const C = window.GRAD_CONFIG || {};
  const ev = C.event || {};
  const $ = (id) => document.getElementById(id);
  const TBA = "Coming soon";
  const DEMO = !C.appsScriptUrl;

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
    const recipient = getRecipient();

    setText("graduateName", C.graduateName);
    setText("major", C.major);
    setText("school", C.school);
    if (!C.major || !C.school) $("majorDot").hidden = true;
    setText("classOf", C.classOf, "");
    setText("footerName", C.graduateName || "me");
    setText("stampYear", C.classOf, "");
    if (C.graduateName) document.title = `${C.graduateName}'s Graduation`;

    if (C.photo) {
      const img = $("heroPhoto");
      img.src = C.photo;
      img.alt = C.graduateName || "Graduate photo";
      img.hidden = false;
      img.parentElement.classList.add("has-photo");
    }

    const L = C.letter || {};
    setText("recipient", recipient || L.defaultRecipient || "friend");
    const body = $("letterBody");
    (L.paragraphs || []).forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
    });
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

    if (C.rsvpDeadline) $("rsvpSub").textContent = `Please let me know by ${C.rsvpDeadline}`;

    if (recipient) {
      $("rsvpName").value = recipient;
      $("wishName").value = recipient;
    }
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
    for (let i = 0; i < 22; i++) {
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
      msg.textContent = "The date is still a secret — check back soon!";
      return;
    }
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        ["cdDays", "cdHours", "cdMins", "cdSecs"].forEach((id) => ($(id).textContent = "00"));
        msg.textContent = diff > -86400000 ? "It's today! See you there!" : "Thank you for celebrating with me!";
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
        { name: "Demo friend", message: "Congratulations! So proud of you!" },
        { name: "Another friend", message: "You did it! Can't wait to celebrate." },
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
    const guests = $("guests");
    const guestsField = $("guestsField");

    const clampGuests = (v) => Math.min(10, Math.max(1, parseInt(v, 10) || 1));
    form.querySelectorAll(".step").forEach((b) =>
      b.addEventListener("click", () => { guests.value = clampGuests(+guests.value + +b.dataset.step); })
    );
    guests.addEventListener("change", () => { guests.value = clampGuests(guests.value); });

    form.addEventListener("change", (e) => {
      if (e.target.name === "attending") guestsField.hidden = e.target.value !== "yes";
    });

    function showThanks(answer) {
      const yes = answer.attending === "yes";
      $("thanksTitle").textContent = yes ? `Yay, see you there, ${answer.name}!` : `Thank you, ${answer.name}!`;
      $("thanksText").textContent = yes
        ? `I've saved ${answer.guests > 1 ? answer.guests + " spots" : "a spot"} for you. Can't wait!`
        : "I'll miss you, but I really appreciate you letting me know.";
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
        guests: fd.get("attending") === "yes" ? clampGuests(fd.get("guests")) : 0,
        note: String(fd.get("note") || "").trim(),
        invitedAs: getRecipient(),
      };
      if (!answer.name) return fail(form, err, "Please tell me your name.");

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Sending...";
      try {
        await send(answer);
        store.set("rsvp", answer);
        showThanks(answer);
        celebrate(answer.attending === "yes");
      } catch (ex) {
        console.error(ex);
        fail(form, err, "Oops, something went wrong. Please try again.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Send my answer";
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
      if (!wish.name || !wish.message) return fail(form, err, "Please fill in your name and wish.");

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Pinning...";
      try {
        await send(wish);
        wall.prepend(noteEl(wish, count++));
        empty.hidden = true;
        form.elements.message.value = "";
        toast("Your wish is on the wall. Thank you!");
        celebrate(false);
      } catch (ex) {
        console.error(ex);
        fail(form, err, "Oops, something went wrong. Please try again.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Pin my wish";
      }
    });
  }

  // ---------- Music ----------
  function setupMusic() {
    if (!C.musicUrl) return;
    const btn = $("musicBtn");
    const audio = $("music");
    audio.src = C.musicUrl;
    btn.hidden = false;
    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().then(() => {
          btn.classList.add("playing");
          btn.setAttribute("aria-label", "Pause music");
        }).catch(() => toast("Couldn't play the music"));
      } else {
        audio.pause();
        btn.classList.remove("playing");
        btn.setAttribute("aria-label", "Play music");
      }
    });
  }

  fillContent();
  splitTitle();
  makeStars();
  setupReveal();
  setupEnvelope();
  setupCountdown();
  setupRsvp();
  setupWishes();
  setupMusic();
  if (DEMO) console.info("Demo mode: set appsScriptUrl in js/config.js to save responses.");
})();
