// app/layout.js
'use client';
import { UserProvider } from '@/components/UserContext';
import './font.css'; // Create this file

import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}