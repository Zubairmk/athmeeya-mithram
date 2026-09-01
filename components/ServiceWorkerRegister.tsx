"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    // updateViaCache: "none" forces the browser to always fetch sw.js (and
    // anything it importScripts) fresh over the network for update checks,
    // never from HTTP cache — otherwise a stale cached sw.js can try to
    // precache asset hashes from a previous deployment that no longer
    // exist, failing installation and leaving the worker "redundant".
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch((err) => {
        console.error("Service worker registration failed", err);
      });
  }, []);

  return null;
}
