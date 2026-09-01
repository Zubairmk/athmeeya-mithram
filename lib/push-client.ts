function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function waitForActivation(
  registration: ServiceWorkerRegistration,
  timeoutMs = 10000,
): Promise<void> {
  if (registration.active) return Promise.resolve();

  const worker = registration.installing || registration.waiting;
  if (!worker) {
    // No worker to watch and none active yet — fall back to the standard
    // ready promise, still under our own timeout rather than hanging.
    return Promise.race([
      navigator.serviceWorker.ready.then(() => undefined),
      new Promise<void>((_, reject) =>
        setTimeout(
          () => reject(new Error("സർവീസ് വർക്കർ തയ്യാറായില്ല (timeout)")),
          timeoutMs,
        ),
      ),
    ]);
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      worker.removeEventListener("statechange", handleChange);
      reject(new Error("സർവീസ് വർക്കർ ആക്റ്റിവേറ്റ് ആയില്ല (timeout)"));
    }, timeoutMs);

    function handleChange() {
      if (worker!.state === "activated") {
        clearTimeout(timer);
        worker!.removeEventListener("statechange", handleChange);
        resolve();
      } else if (worker!.state === "redundant") {
        clearTimeout(timer);
        worker!.removeEventListener("statechange", handleChange);
        reject(new Error("സർവീസ് വർക്കർ ആക്റ്റിവേറ്റ് ആകുന്നതിന് മുൻപ് നിലച്ചു"));
      }
    }

    worker.addEventListener("statechange", handleChange);
  });
}

export async function subscribeToPush(
  morningTime: string,
  eveningTime: string,
  onProgress?: (step: string) => void,
): Promise<boolean> {
  if (!isPushSupported()) return false;

  onProgress?.("അനുമതി അഭ്യർത്ഥിക്കുന്നു...");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  onProgress?.("സർവീസ് വർക്കർ പരിശോധിക്കുന്നു...");
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none",
    });
  }

  onProgress?.("സർവീസ് വർക്കർ ആക്റ്റിവേറ്റ് ആകുന്നു...");
  await waitForActivation(registration);

  onProgress?.("സബ്സ്ക്രൈബ് ചെയ്യുന്നു...");
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
    if (!vapidKey) {
      throw new Error("VAPID key missing from build — check NEXT_PUBLIC_VAPID_KEY");
    }
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  onProgress?.("സേവ് ചെയ്യുന്നു...");
  const json = subscription.toJSON();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      reminder_morning_time: morningTime,
      reminder_evening_time: eveningTime,
      timezone,
    }),
  });

  return res.ok;
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });
}
