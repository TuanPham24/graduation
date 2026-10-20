(function () {
  "use strict";

  const C = window.GRAD_CONFIG || {};
  const ev = C.event || {};
  const $ = (id) => document.getElementById(id);
  const TBA = "Sắp công bố";
  const DEMO = !C.appsScriptUrl;
  const TZ = "Asia/Ho_Chi_Minh";

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

  function setImg(id, src, src2x) {
    const img = $(id);
    if (!img || !src) return;
    img.src = src;
    if (src2x) img.srcset = `${src} 1x, ${src2x} 2x`;
  }

  function getRecipient() {
    const to = new URLSearchParams(location.search).get("to");
    return to ? to.trim().slice(0, 40) : "";
  }

  function eventDate() {
    const d = ev.dateTime ? new Date(ev.dateTime) : null;
    return d && !isNaN(d) ? d : null;
  }

  function dateParts(d) {
    const parts = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" })
      .formatToParts(d).forEach((p) => { parts[p.type] = p.value; });
    parts.weekday = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(d);
    return parts;
  }

  function mapHref() {
    if (ev.mapUrl && /^https?:\/\//i.test(ev.mapUrl)) return ev.mapUrl;
    if (ev.venueAddress) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venueAddress)}`;
    return "";
  }

  // ---------- Fill content ----------
  function fillContent() {
    setText("graduateName", C.graduateName);
    setText("major", C.major);
    setText("school", C.school);
    if (!C.major || !C.school) $("majorDot").hidden = true;
    ["classOf", "stampYear", "envYear", "pcStampClass"].forEach((id) => setText(id, C.classOf, ""));
    setText("footerName", C.graduateName || "mình");
    if (C.graduateName) document.title = `Lễ tốt nghiệp của ${C.graduateName}`;

    setImg("heroPhoto", C.heroPhoto, C.heroPhoto2x);
    setImg("envPhoto", C.photo, C.photo2x);
    const T = C.thankYou || {};
    setImg("thanksPhoto", T.photo, T.photo2x);

    const d = eventDate();
    if (d) {
      const p = dateParts(d);
      const full = `${p.day}.${p.month}.${p.year}`;
      $("mastDate").textContent = full;
      $("sdWeekday").textContent = p.weekday;
      $("sdDay").textContent = String(Number(p.day));
      $("sdMonth").textContent = `${p.month} / ${p.year}`;
      $("pcStampDate").textContent = full;
    } else {
      $("mastDate").textContent = `Coming soon · ${C.classOf || ""}`.trim();
      $("sdWeekday").textContent = "Coming soon";
      $("sdDay").textContent = "?";
      $("sdMonth").textContent = C.classOf || "";
      $("pcStampDate").textContent = C.classOf || "";
    }
    setText("sdNote", C.saveTheDateNote);

    const L = C.letter || {};
    setText("signOff", L.signOff);
    setText("signature", C.graduateName);
    setText("thanksSign", C.graduateName);

    setText("eventDate", ev.displayDate, TBA);
    setText("eventTime", ev.displayTime, TBA);
    setText("venueName", ev.venueName, TBA);
    setText("venueAddress", ev.venueAddress);
    if (ev.dressCode) setText("dressCode", ev.dressCode);
    else $("dressCard").hidden = true;
    if (ev.contact) setText("eventContact", ev.contact);
    else $("contactRow").hidden = true;

    const href = mapHref();
    if (href) {
      [$("mapLink"), $("locMapLink")].forEach((a) => { a.href = href; a.hidden = false; });
    }

    if (C.rsvpDeadline) $("rsvpSub").textContent = `Bạn báo cho mình trước ngày ${C.rsvpDeadline} nhé`;

    const loc = C.location || {};
    setText("locNote", loc.note);
    setText("locVenue", ev.venueName, TBA);
    setText("locAddress", ev.venueAddress);
    if (ev.contact) setText("locContact", ev.contact);
    else $("locContactRow").hidden = true;
    const dirBox = $("locDirections");
    const dirs = Array.isArray(loc.directions) ? loc.directions : [];
    if (!dirs.length) {
      const p = document.createElement("p");
      p.className = "tba";
      p.textContent = TBA;
      dirBox.appendChild(p);
    }
    dirs.forEach((dir) => {
      if (dir.from) {
        const h = document.createElement("p");
        h.className = "ln-from";
        h.textContent = dir.from;
        dirBox.appendChild(h);
      }
      const ul = document.createElement("ul");
      (dir.steps || []).forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s;
        ul.appendChild(li);
      });
      dirBox.appendChild(ul);
    });

    setText("musicTitle", C.musicTitle || "Nhạc nền");
    setText("musicArtist", C.musicArtist, "");
  }

  // ---------- Collage ----------
  const TILTS = [0, -4, 3, -2, 4, -3, 2, -5, 3, -2];
  function renderCollage() {
    const box = $("collage");
    (C.gallery || []).forEach((item, i) => {
      const [src, src2x] = Array.isArray(item) ? item : [item];
      const fig = document.createElement("figure");
      fig.className = `cl-item cl-${i} reveal${i === 0 ? " cl-big" : ""}`;
      fig.style.setProperty("--tilt", `${TILTS[i % TILTS.length]}deg`);
      const img = document.createElement("img");
      img.src = src;
      if (src2x) img.srcset = `${src} 1x, ${src2x} 2x`;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      fig.appendChild(img);
      if (i > 0) {
        const tape = document.createElement("span");
        tape.className = "tape";
        tape.setAttribute("aria-hidden", "true");
        fig.appendChild(tape);
      }
      box.appendChild(fig);
    });
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

  function fillParagraphs(box, list, shown) {
    box.textContent = "";
    (list || []).forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text.split("{name}").join(shown);
      box.appendChild(p);
    });
  }

  function applyGuest(name) {
    const L = C.letter || {};
    const shown = name || L.defaultRecipient || "bạn";
    $("recipient").textContent = shown;
    $("envTo").textContent = shown;
    $("heroHello").textContent = name ? `Xin chào, ${name}!` : "";

    const body = $("letterBody");
    fillParagraphs(body, L.paragraphs, shown);
    const ps = name && findPersonalNote(name);
    if (ps) {
      const p = document.createElement("p");
      p.className = "letter-ps";
      p.textContent = `P.S. ${ps}`;
      body.appendChild(p);
    }
    fillParagraphs($("thanksBody"), (C.thankYou || {}).paragraphs, name || "bạn");

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
    let current = "";

    const open = () => {
      input.value = current || store.get("guestName") || getRecipient();
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
      current = name;
      store.set("guestName", name);
      applyGuest(name);
      gate.classList.add("leaving");
      document.body.classList.remove("gated");
      setTimeout(() => { gate.hidden = true; }, 700);
      onEnter(name);
    });

    $("changeName").addEventListener("click", open);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    open();
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
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => io.observe(el));
  }

  // ---------- Crayon kid ----------
  function setupKid() {
    const el = $("kid");
    const bubble = $("kidBubble");
    const env = $("envelope");
    let bubbleTimer, moodTimer;
    let pinned = false;

    function say(text, ms = 3800) {
      bubble.textContent = text;
      bubble.classList.add("show");
      clearTimeout(bubbleTimer);
      pinned = !ms;
      if (ms) bubbleTimer = setTimeout(() => bubble.classList.remove("show"), ms);
    }

    function hush() {
      pinned = false;
      clearTimeout(bubbleTimer);
      bubble.classList.remove("show");
    }

    function react(text, mood) {
      el.classList.remove("point", "cheer", "happy");
      say(text, 4500);
      if (!mood) return;
      void el.offsetWidth;
      el.classList.add("happy");
      if (mood === "cheer") el.classList.add("cheer");
      clearTimeout(moodTimer);
      moodTimer = setTimeout(() => el.classList.remove("cheer", "happy"), 2600);
    }

    function point(on) {
      el.classList.toggle("point", on);
      if (on) say("Bấm vào phong bì để mở thư nha!", 0);
      else if (pinned) hush();
    }

    const pokes = ["Hihi, nhột quá!", "Nhớ đến dự lễ của mình nha!", "Kéo xuống xem tiếp đi bạn ơi!", "Mình tốt nghiệp rồi nè!"];
    let pokeIndex = 0;
    el.addEventListener("click", () => react(pokes[pokeIndex++ % pokes.length], "cheer"));

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        if (document.body.classList.contains("gated")) return;
        point(e.isIntersecting && !env.classList.contains("open"));
      }, { rootMargin: "-35% 0px -35% 0px" }).observe($("letter"));
    }

    return { say, react, point };
  }

  // ---------- Envelope ----------
  function setupEnvelope(kid) {
    const env = $("envelope");
    const section = $("invitation");
    env.addEventListener("click", () => {
      const wasOpen = env.classList.contains("open");
      env.classList.add("open");
      kid.point(false);
      setTimeout(() => {
        if (section.hidden) {
          section.hidden = false;
          section.querySelectorAll(".reveal").forEach((r) => r.classList.add("in"));
          section.classList.add("unfold");
          kid.react("Thư của bạn đây, đọc hết nha!", "happy");
        }
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }, wasOpen ? 0 : 900);
    });
  }

  // ---------- Countdown ----------
  function setupCountdown() {
    const target = eventDate();
    const msg = $("cdMessage");
    if (!target) {
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
  function setupRsvp(kid) {
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
        if (answer.attending === "yes") kid.react(`Yay! Cảm ơn ${answer.name} nha, hẹn gặp bạn ở buổi lễ!`, "cheer");
        else kid.react("Tiếc ghê... cảm ơn bạn đã báo cho mình nha!");
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
    n.className = `note n${i % 4}`;
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

  function setupWishes(kid) {
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
        kid.react("Cảm ơn lời chúc của bạn nhiều lắm!", "happy");
        empty.hidden = true;
        form.elements.message.value = "";
        toast(DEMO
          ? "Chế độ demo: chưa kết nối Google Sheet nên lời chúc chưa được lưu."
          : "Lời chúc của bạn đã được ghim lên tường. Cảm ơn bạn!");
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
    } else if (C.youtubeMusicId && window.createYouTubeMusic) {
      player = window.createYouTubeMusic(C.youtubeMusicId);
    } else if (C.builtInMusic !== false && window.createMusicBox) {
      player = window.createMusicBox();
    }
    if (!player) return null;

    const btns = [$("musicBtn"), $("musicCardBtn")];
    const card = $("musicCard");
    $("musicBtn").hidden = false;
    card.hidden = false;
    $("musicHint").hidden = false;

    const pointer = $("musicPointer");
    const mBtn = $("musicBtn");
    let hinted = false;
    let hintTimer;
    const hideHint = () => {
      clearTimeout(hintTimer);
      pointer.classList.remove("show");
      mBtn.classList.remove("attn");
    };
    const showHint = () => {
      if (hinted) return;
      hinted = true;
      pointer.hidden = false;
      void pointer.offsetWidth;
      pointer.classList.add("show");
      mBtn.classList.add("attn");
      hintTimer = setTimeout(hideHint, 9000);
    };

    let on = false;
    const setOn = (v) => {
      on = v;
      if (v) setTimeout(() => { if (on) showHint(); }, 4500);
      else hideHint();
      card.classList.toggle("playing", v);
      btns.forEach((b) => {
        b.classList.toggle("playing", v);
        b.setAttribute("aria-label", v ? "Tắt nhạc" : "Bật nhạc");
      });
    };
    const toggle = () => {
      if (on) { player.pause(); setOn(false); return; }
      Promise.resolve(player.play()).then(() => setOn(true)).catch(() => toast("Không phát được nhạc"));
    };
    btns.forEach((b) => b.addEventListener("click", toggle));
    document.addEventListener("visibilitychange", () => {
      if (!on) return;
      if (document.hidden) player.pause();
      else player.play();
    });
    return { start: () => { if (!on) toggle(); } };
  }

  fillContent();
  renderCollage();
  applyGuest("");
  setupReveal();
  const kid = setupKid();
  setupEnvelope(kid);
  setupCountdown();
  setupRsvp(kid);
  setupWishes(kid);
  const music = setupMusic();
  setupGate((name) => {
    if (music) music.start();
    setTimeout(() => kid.react(`Chào ${name}! Kéo xuống xem thiệp với mình nha!`, "happy"), 700);
  });
  if (DEMO) console.info("Demo mode: set appsScriptUrl in js/config.js to save responses.");
})();
