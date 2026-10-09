import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  showSettings?: boolean;
}

export function PageContainer({ children, className = '', showSettings = true }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-white pb-28 ${className}`}>
      <div className="max-w-md mx-auto h-full relative">
        {children}
      </div>
    </div>
  );
}
