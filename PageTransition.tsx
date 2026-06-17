import { useEffect, useState, type ReactNode } from 'react';

interface PageTransitionProps {
  viewKey: string;
  children: ReactNode;
}

export function PageTransition({ viewKey, children }: PageTransitionProps) {
  const [visible, setVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(viewKey);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (viewKey !== currentKey) {
      setTransitioning(true);
      setVisible(false);
      const t = setTimeout(() => {
        setCurrentKey(viewKey);
        setTransitioning(false);
        setTimeout(() => setVisible(true), 30);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [viewKey, currentKey]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {transitioning && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 rounded-full border-3 border-gray-200" style={{ borderWidth: '3px' }} />
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderColor: 'transparent',
                  borderTopColor: '#1d4ed8',
                }}
              />
            </div>
            <p className="text-xs text-gray-400 font-medium">Cargando...</p>
          </div>
        </div>
      )}
      <div
        className="transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        {children}
      </div>
    </>
  );
}
