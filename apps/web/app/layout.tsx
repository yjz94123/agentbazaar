import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { LangProvider } from '@/contexts/LangContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentBazaar - AI Agent Marketplace',
  description: 'Discover and use verified AI agents with on-chain identity and pay-per-task pricing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-surface-900">
        <LangProvider>
        <WalletProvider>
          <NavBar />
          <main>{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid rgba(148,163,184,0.1)',
              },
            }}
          />
        </WalletProvider>
        </LangProvider>
      </body>
    </html>
  );
}
