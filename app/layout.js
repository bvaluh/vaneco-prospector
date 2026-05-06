import './globals.css';

export const metadata = {
  title: 'Vaneco Prospector',
  description: 'AI-powered B2B prospect intelligence',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
