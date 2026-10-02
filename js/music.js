// Built-in music box tune, synthesized with Web Audio (no audio file to download).
(function () {
  "use strict";

  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const midi = (n) => PC[n[0]] + (Number(n.slice(-1)) + 1) * 12;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // [root, minor?]
  const CH = { C: ["C", 0], G: ["G", 0], Am: ["A", 1], F: ["F", 0], Em: ["E", 1], Dm: ["D", 1] };

  // Each bar is 4 beats; melody durations are in beats.
  const SONG = [
    [["C"], [["E5", 1], ["G5", 1], ["C6", 1.5], ["B5", 0.5]]],
    [["G"], [["D6", 1], ["B5", 1], ["G5", 2]]],
    [["Am"], [["A5", 1], ["C6", 1], ["E6", 1], ["D6", 1]]],
    [["F"], [["C6", 1], ["A5", 1], ["F5", 2]]],
    [["C"], [["E5", 1], ["G5", 1], ["C6", 1], ["E6", 1]]],
    [["G"], [["D6", 1.5], ["C6", 0.5], ["B5", 1], ["G5", 1]]],
    [["F", "G"], [["A5", 1], ["C6", 1], ["B5", 1], ["D6", 1]]],
    [["C"], [["C6", 3], [null, 1]]],
    [["Am"], [["E6", 1], ["D6", 1], ["C6", 1], ["A5", 1]]],
    [["Em"], [["B5", 1], ["G5", 1], ["E5", 2]]],
    [["F"], [["F5", 1], ["A5", 1], ["C6", 1], ["F6", 1]]],
    [["C"], [["E6", 1.5], ["D6", 0.5], ["C6", 2]]],
    [["Dm"], [["D6", 1], ["F6", 1], ["A5", 1], ["D6", 1]]],
    [["G"], [["B5", 1], ["D6", 1], ["G6", 2]]],
    [["F", "G"], [["A5", 1], ["F6", 1], ["D6", 1], ["B5", 1]]],
    [["C"], [["C6", 4]]],
  ];

  // Flatten into a list of events per eighth-note step.
  const STEPS = SONG.length * 8;
  const events = Array.from({ length: STEPS }, () => []);
  SONG.forEach(([chords, melody], bar) => {
    const base = bar * 8;
    let pos = base;
    melody.forEach(([note, beats]) => {
      if (note) events[pos].push({ kind: "mel", m: midi(note) });
      pos += beats * 2;
    });
    chords.forEach((name, half) => {
      if (chords.length === 1 && half > 0) return;
      const [root, minor] = CH[name];
      let r = PC[root] + 48;
      if (r > 55) r -= 12;
      const third = minor ? 3 : 4;
      const halves = chords.length === 1 ? [0, 4] : [half * 4];
      halves.forEach((h) => {
        const s = base + h;
        events[s].push({ kind: "bass", m: r - 12 });
        [r, r + 7, r + 12, r + 12 + third].forEach((m, i) => events[s + i].push({ kind: "arp", m: m + 12 }));
      });
    });
  });

  window.createMusicBox = function () {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const EIGHTH = 60 / 104 / 2;
    let ctx, bus, master, timer;
    let nextTime = 0;
    let step = 0;

    function init() {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      bus = ctx.createGain();
      bus.connect(master);
      const delay = ctx.createDelay();
      delay.delayTime.value = EIGHTH * 1.5;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.25;
      const wet = ctx.createGain();
      wet.gain.value = 0.2;
      bus.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(wet).connect(master);
    }

    function tone(m, t, vol, decay, type) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = hz(m);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + decay + 0.05);
    }

    function play(ev, t) {
      if (ev.kind === "mel") {
        tone(ev.m, t, 0.22, 1.4, "sine");
        tone(ev.m + 12, t, 0.04, 0.5, "sine");
      } else if (ev.kind === "arp") {
        tone(ev.m, t, 0.05, 0.45, "triangle");
      } else {
        tone(ev.m, t, 0.14, 1.1, "sine");
      }
    }

    function schedule() {
      while (nextTime < ctx.currentTime + 0.3) {
        events[step % STEPS].forEach((ev) => play(ev, nextTime));
        nextTime += EIGHTH;
        step++;
      }
    }

    return {
      play() {
        if (!ctx) init();
        return ctx.resume().then(() => {
          if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
          clearInterval(timer);
          timer = setInterval(schedule, 80);
          schedule();
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.4);
        });
      },
      pause() {
        if (!ctx) return;
        clearInterval(timer);
        ctx.suspend();
      },
    };
  };
})();
