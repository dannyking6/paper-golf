/*
 * game-driver.js — neutral offline driver replacing the GameSnacks platform SDK.
 * Implements the exact surface the game calls: game lifecycle, audio, storage,
 * score, and the H5-games ad-break flow (all callbacks resolve instantly,
 * "viewed" outcome, no network).
 */
(function () {
  "use strict";
  var TAG = "[GameDriver]";
  function log() {
    try { console.debug.apply(console, [TAG].concat([].slice.call(arguments))); } catch (e) {}
  }
  function fn(f) { return typeof f === "function" ? f : null; }

  var GameSnacks = {
    version: "offline-driver-1.0.0",

    game: {
      ready: function () { log("game.ready"); },
      firstFrameReady: function () { log("game.firstFrameReady"); },
      gameOver: function () { log("game.gameOver"); },
      levelComplete: function (n) { log("game.levelComplete", n); },
      onPause: function (cb) {
        cb = fn(cb);
        document.addEventListener("visibilitychange", function () {
          if (document.hidden && cb) { log("game.onPause fire"); cb(); }
        });
      },
      onResume: function (cb) {
        cb = fn(cb);
        document.addEventListener("visibilitychange", function () {
          if (!document.hidden && cb) { log("game.onResume fire"); cb(); }
        });
      }
    },

    audio: {
      isEnabled: function () { return true; },
      subscribe: function (cb) {
        cb = fn(cb);
        // Defer until after page load so engine bridges (c2_callFunction etc.)
        // are already installed by the game runtime.
        if (cb) {
          var fire = function () { try { cb(true); } catch (e) { log("audio cb err", e); } };
          if (document.readyState === "complete") setTimeout(fire, 300);
          else window.addEventListener("load", function () { setTimeout(fire, 300); });
        }
      }
    },

    storage: {
      // Synchronous string semantics: also valid as `await GameSnacks.storage.getItem(k)`.
      getItem: function (k) {
        try { return window.localStorage.getItem(k); } catch (e) { return null; }
      },
      setItem: function (k, v) {
        try { window.localStorage.setItem(k, v); } catch (e) {}
      }
    },

    score: {
      update: function (n) { log("score.update", n); }
    },

    ad: {
      break: function (opts) {
        opts = opts || {};
        log("ad.break type=" + opts.type);
        // Follow the h5games ad-break sequence: beforeAd -> (reward: beforeReward
        // + showAdFn) -> adViewed -> afterAd -> adBreakDone({breakStatus:"viewed"}).
        setTimeout(function () {
          var b = fn(opts.beforeAd); if (b) b();
          if (opts.type === "reward") {
            var br = fn(opts.beforeReward);
            if (br) br(function () { log("showAdFn (noop)"); });
            var v = fn(opts.adViewed);
            if (v) v();
          }
          var a = fn(opts.afterAd); if (a) a();
          var d = fn(opts.adBreakDone);
          if (d) d({ breakStatus: "viewed", type: opts.type || "next" });
        }, 0);
      }
    }
  };

  // Guard: engines (Construct/Phaser) install the real c2_callFunction later.
  // A no-op here keeps any early bridge call harmless; the runtime overwrites it.
  if (typeof window.c2_callFunction !== "function") {
    window.c2_callFunction = function () {};
  }

  window.GameSnacks = GameSnacks;
  window.GameDriver = GameSnacks; // alias for debugging

  window.addEventListener("error", function (e) {
    log("window.onerror:", e.message, e.filename, e.lineno);
  });
  log("initialized");
})();
