import React from 'react';

interface ProtectedRouteProps {
  authChecked: boolean;
  firebaseUser: any;
  isGuestMode?: boolean;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  authChecked,
  firebaseUser,
  isGuestMode,
  fallback,
  children
}) => {
  if (!authChecked) {
    return (
      <div id="auth-loading-screen" className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-[#C23E9E] border-[#1A1A1A] animate-spin" />
        <p className="text-xs font-mono text-[#8A8A8A] uppercase tracking-wider">Verificando Credenciales...</p>
      </div>
    );
  }

  if (!firebaseUser && !isGuestMode) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
