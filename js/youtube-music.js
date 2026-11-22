// Plays a YouTube video's audio in the background via YouTube's own official
// embed (IFrame Player API). Nothing is downloaded or re-hosted — playback
// happens inside YouTube's player, same as embedding a video on any page.
(function () {
  "use strict";

  let apiPromise = null;
  function loadApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        resolve(window.YT);
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
    return apiPromise;
  }

  window.createYouTubeMusic = function (videoId) {
    const wrap = document.createElement("div");
    wrap.className = "yt-music-wrap";
    const host = document.createElement("div");
    wrap.appendChild(host);
    document.body.appendChild(wrap);

    let player = null;
    let failure = null; // set once YouTube refuses to play this video
    let waiters = []; // play() calls waiting for the video to actually start

    const settle = (err) => {
      const list = waiters;
      waiters = [];
      list.forEach((w) => (err ? w.reject(err) : w.resolve()));
    };

    // Rejects if the video can't be embedded (removed, private, or embedding disabled by its owner),
    // so the caller can tell the guest instead of silently doing nothing.
    const readyPromise = loadApi().then(
      (YT) =>
        new Promise((resolve, reject) => {
          player = new YT.Player(host, {
            width: "2",
            height: "2",
            videoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              loop: 1,
              playlist: videoId,
              origin: location.origin,
            },
            events: {
              onReady: () => resolve(),
              onStateChange: (e) => {
                if (e.data === YT.PlayerState.PLAYING) settle();
              },
              // 2: bad id, 5: HTML5 error, 100: not found/private, 101/150: owner disabled embedding
              onError: (e) => {
                failure = new Error(`YouTube player error ${e.data}`);
                reject(failure);
                settle(failure);
              },
            },
          });
        })
    );

    return {
      // Resolves only once audio is really playing; rejects if YouTube refuses the video.
      play() {
        if (failure) return Promise.reject(failure);
        return readyPromise.then(
          () =>
            new Promise((resolve, reject) => {
              waiters.push({ resolve, reject });
              player.playVideo();
            })
        );
      },
      pause() {
        settle(new Error("paused"));
        if (player && player.pauseVideo) player.pauseVideo();
      },
    };
  };
})();
