import { useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LogOut, User, Clock, Maximize2, Minimize2 } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PROXY_URL = `${SUPABASE_URL}/functions/v1/optimizer-proxy`;

interface DashboardProps {
  onSignOut: () => void;
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [accessTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setAuthToken] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthToken(session.access_token);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Anaplan Optimizer Portal
                </h1>
                <p className="text-sm text-gray-500">Universal Access Interface</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Accessed: {accessTime.toLocaleTimeString()}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.email}
                  </span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${isFullscreen ? 'fixed inset-0 z-50 pt-0' : 'p-4'}`}>
        <div className={`${isFullscreen ? 'h-full' : 'max-w-full mx-auto h-[calc(100vh-120px)] supports-[height:100dvh]:h-[calc(100dvh-120px)]'} bg-white rounded-lg shadow-lg overflow-hidden relative`}>
          {!isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-md transition-all"
              title="Enter fullscreen"
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-md transition-all"
              title="Exit fullscreen"
            >
              <Minimize2 className="w-5 h-5 text-gray-700" />
            </button>
          )}

          <iframe
            src={`${PROXY_URL}?path=/`}
            className="w-full h-full border-0"
            title="Optimizer Application"
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          />
        </div>

        {!isFullscreen && (
          <div className="max-w-full mx-auto mt-4 px-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    About This Portal
                  </h3>
                  <p className="text-sm text-blue-800">
                    This portal proxies your optimizer application through a secure Supabase Edge Function, bypassing client firewall restrictions. All traffic is routed through your authenticated portal domain, eliminating the need for URL whitelisting at the client site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
