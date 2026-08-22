import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Slow Database Query',
  description: 'Task 2 debugging session',
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
