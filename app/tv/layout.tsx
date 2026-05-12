// TV-specific layout: no header/footer, dark background, larger spacing.
// Children pages target a 1920×1080 viewport (most Smart TV browsers).
import type { Metadata } from 'next';
import './tv.css';

export const metadata: Metadata = {
  title: 'Vincula Formation — Mode TV',
};

export default function TVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tv-root">
      <div className="tv-topbar">
        <span className="tv-logo">▶ Vincula Formation</span>
        <span className="tv-hint">⬆ ⬇ ⬅ ➡ pour naviguer · OK pour valider</span>
      </div>
      <div className="tv-main">{children}</div>
    </div>
  );
}
