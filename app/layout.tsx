import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Chatchance - Connect and Chat with People Worldwide | Omegle Alternative | Chatting Platform',
    description:
        "Connect globally with Chatchance! Engage in anonymous talks, expand your social circle, and enjoy diverse conversations spanning the world's corners. Experience an Omegle-like platform offering seamless interactions, limitless connections, and anonymous chats across cultures and interests.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
