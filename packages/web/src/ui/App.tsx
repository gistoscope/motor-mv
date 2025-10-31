import React from 'react';
import { render } from '@motor/micro-viewer';
import { ErrorBoundary } from './ErrorBoundary';

// Lazy import to avoid pulling dev route if not needed
const StepDevRoute = React.lazy(() => import('../routes/dev/step/StepDevRoute'));

const isTrue = (v: any) => {
  if (v === true) return true;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return false;
};
const EXP = isTrue(import.meta.env.VITE_EXPERIMENTAL_M0);

function DevHome() {
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <h1 style={{ margin: '8px 0 16px' }}>Motor Dev</h1>
      {EXP ? (
        <div>
          <p>Development tools are enabled.</p>
          <a href="/dev/step" style={{ color: '#2563eb', textDecoration: 'underline' }}>/dev/step</a>
        </div>
      ) : (
        <div style={{ color: '#555' }}>
          <p>Set <code>VITE_EXPERIMENTAL_M0=true</code> to enable development routes.</p>
        </div>
      )}
    </div>
  );
}

function MicroViewerDemo() {
  React.useEffect(() => {
    render('#mv-root', '\\frac{a+b}{c-d}').catch((error) => {
      console.error('micro-viewer demo failed', error);
    });
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <h1 style={{ margin: '8px 0 16px' }}>Micro Viewer Demo</h1>
      <p style={{ margin: '8px 0 16px', maxWidth: 480, color: '#555' }}>The KaTeX expression below is rendered through <code>@motor/micro-viewer</code> using the lightweight <code>render()</code> helper.</p>
      <div id="mv-root" style={{ minHeight: 48, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fafafa' }} />
    </div>
  );
}

export default function App() {
  // Minimal router to avoid external deps: render StepDevRoute only when path matches
  const atDevStep = typeof window !== 'undefined' && window.location.pathname.startsWith('/dev/step');
  const atMicroViewer = typeof window !== 'undefined' && window.location.pathname.startsWith('/mv');

  const content = atMicroViewer ? <MicroViewerDemo /> : EXP && atDevStep ? <StepDevRoute /> : <DevHome />;

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
        {content}
      </React.Suspense>
    </ErrorBoundary>
  );
}
