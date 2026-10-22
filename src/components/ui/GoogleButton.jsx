import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

// "Continue with Google" through Google Identity Services. Google draws the button
// (in the visitor's language) and hands back an ID token, which the server verifies.
// Hidden unless VITE_GOOGLE_CLIENT_ID is set.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCRIPT = 'https://accounts.google.com/gsi/client';

let scriptPromise;
function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ||= new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = SCRIPT;
    el.async = true;
    el.onload = resolve;
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error('Google sign-in could not load.'));
    };
    document.head.appendChild(el);
  });
  return scriptPromise;
}

export default function GoogleButton({ signup, onCredential, onError }) {
  const { locale, theme } = useApp();
  const box = useRef(null);
  const [width, setWidth] = useState(0);
  // Keep the latest handlers without re-drawing the button on every render.
  const handlers = useRef({ onCredential, onError });
  handlers.current = { onCredential, onError };

  useEffect(() => {
    const measure = () => setWidth(Math.min(400, Math.floor(box.current?.offsetWidth || 0)));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !width) return;
    let live = true;
    loadScript()
      .then(() => {
        if (!live || !box.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => handlers.current.onCredential(res.credential),
          ux_mode: 'popup',
          context: signup ? 'signup' : 'signin',
        });
        window.google.accounts.id.renderButton(box.current, {
          type: 'standard',
          theme: theme === 'cosmic' ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'pill',
          text: signup ? 'signup_with' : 'continue_with',
          logo_alignment: 'center',
          locale,
          width,
        });
      })
      .catch((err) => live && handlers.current.onError?.(err));
    return () => {
      live = false;
    };
  }, [signup, locale, theme, width]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={box} className="flex min-h-[44px] w-full justify-center" />;
}
