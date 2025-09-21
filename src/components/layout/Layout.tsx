import React from 'react';
import Header from './Header';
import ErrorBoundary from '../ErrorBoundary';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ErrorBoundary>
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default Layout;