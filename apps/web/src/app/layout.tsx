import type { Metadata } from 'next';
import { Open_Sans as FontSans } from 'next/font/google';

import './globals.css';

import { Toaster } from '~/components/ui/sonner';
import { QueryClientProvider } from '~/providers/query-client-provider';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    template: '%s - RH',
    default: 'RH',
  },
  description: 'Sistema de gestão de recursos humanos',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${fontSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <QueryClientProvider>
          {children}
          <Toaster position="top-center" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
