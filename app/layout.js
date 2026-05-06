import { ClerkProvider, SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: 'Vaneco Prospector',
  description: 'AI-powered B2B prospect intelligence',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <header style={{
            borderBottom: '0.5px solid var(--border)',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Vaneco Prospector</span>
            </div>
            <div>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button style={{ marginRight: 8, fontSize: 13, padding: '6px 14px' }}>Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button style={{ fontSize: 13, padding: '6px 14px' }}>Sign up</button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}