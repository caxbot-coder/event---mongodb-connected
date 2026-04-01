import './globals.css';
import ClientRootLayout from '@/components/ClientRootLayout';
import BlockedUserGate from '@/components/BlockedUserGate';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BlockedUserGate>
          <ClientRootLayout>{children}</ClientRootLayout>
        </BlockedUserGate>
      </body>
    </html>
  );
}
