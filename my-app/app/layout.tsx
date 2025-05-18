// app/layout.js
'use client';
import { UserProvider } from '@/components/UserContext';
import './font.css'; // Create this file

export default function RootLayout({ children }) {
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