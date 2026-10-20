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
    let pendingPlay = false;

    const readyPromise = loadApi().then(
      (YT) =>
        new Promise((resolve) => {
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
              onReady: () => {
                if (pendingPlay) player.playVideo();
                resolve();
              },
            },
          });
        })
    );

    return {
      play() {
        pendingPlay = true;
        return readyPromise.then(() => player.playVideo());
      },
      pause() {
        pendingPlay = false;
        if (player && player.pauseVideo) player.pauseVideo();
      },
    };
  };
})();
