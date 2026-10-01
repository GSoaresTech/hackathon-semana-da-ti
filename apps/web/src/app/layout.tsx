import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';

import './globals.css';

import { Toaster } from '~/components/ui/sonner';
import { QueryClientProvider } from '~/providers/query-client-provider';

const fontNunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: {
    template: '%s · Triar',
    default: 'Triar',
  },
  description: 'Diz o que você sente. Mostra para onde ir — no SUS ou no plano.',
};

export const viewport: Viewport = {
  themeColor: '#1463c7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${fontNunito.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <QueryClientProvider>
          {children}
          <Toaster position="top-center" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
