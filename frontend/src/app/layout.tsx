import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Silent Frontend Failure',
  description: 'Task1 debugging session',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
