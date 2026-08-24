import { useEffect, useRef, useState } from 'react';

const siteKey = '0x4AAAAAAEZjKbgfrhAFdKGf';
const scriptId = 'cloudflare-turnstile-script';

type TurnstileOptions = {
  sitekey: string;
  action: string;
  theme: 'light' | 'dark' | 'auto';
  callback: (token: string) => void;
  'expired-callback': () => void;
  retry?: 'auto' | 'never';
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  'error-callback': (errorCode?: string) => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  ready: (callback: () => void) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loadPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return new Promise<void>((resolve) => window.turnstile?.ready(() => resolve()));
  if (loadPromise) return loadPromise;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    let settled = false;
    let timer: number | undefined;
    const finish = () => {
      if (settled || !window.turnstile) return;
      settled = true;
      if (timer !== undefined) window.clearInterval(timer);
      window.turnstile.ready(() => resolve());
    };
    const fail = (reason: Error) => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) window.clearInterval(timer);
      reject(reason);
    };
    const onLoad = () => {
      finish();
    };
    if (window.turnstile) {
      finish();
      return;
    }
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', () => fail(new Error('Turnstile could not load.')), { once: true });
    if (!existing) {
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      document.head.appendChild(script);
    }
    // A route change can mount after api.js has already fired its load event.
    timer = window.setInterval(finish, 25);
    window.setTimeout(() => fail(new Error('Turnstile did not initialise.')), 5_000);
  }).catch((error) => {
    loadPromise = null;
    throw error;
  });
  loadPromise = promise;
  return promise;
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void;
  resetSignal: boolean;
};

/** Explicit rendering is required because checkout is mounted dynamically by the SPA. */
export function TurnstileWidget({ onTokenChange, resetSignal }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const previousResetSignal = useRef(resetSignal);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        try {
          containerRef.current.replaceChildren();
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action: 'consultation',
            theme: 'light',
            retry: 'auto',
            'refresh-expired': 'auto',
            callback: (token) => { setLoadError(null); onTokenChangeRef.current(token); },
            'expired-callback': () => onTokenChangeRef.current(''),
            'error-callback': () => {
              onTokenChangeRef.current('');
              setLoadError('The security check could not complete. It will retry automatically.');
            },
          });
        } catch {
          setLoadError('The security check could not start. Please refresh the page and try again.');
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('The security check could not load. Please refresh the page and try again.');
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (previousResetSignal.current && !resetSignal && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenChangeRef.current('');
    }
    previousResetSignal.current = resetSignal;
  }, [resetSignal]);

  return (
    <div>
      <div ref={containerRef} />
      {loadError && <p className="mt-2 text-sm text-destructive">{loadError}</p>}
    </div>
  );
}
