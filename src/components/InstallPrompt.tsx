'use client';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = 
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if already dismissed
    const wasDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || isInstalled || dismissed) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={handleDismiss}
      />

      {/* Install Card */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto 
        sm:right-6 sm:w-96 z-50"
        style={{ animation: 'slideUp 0.4s ease forwards' }}>
        <div className="bg-[#0d1024] border border-purple-500/30
          rounded-3xl p-5 shadow-2xl shadow-purple-900/50">

          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl
              bg-gradient-to-br from-purple-600 to-pink-600
              flex items-center justify-center flex-shrink-0
              shadow-lg shadow-purple-500/30">
              <span className="text-white font-black text-xl">IQ</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base">
                Install AdmissionIQ
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Add to home screen • Works offline
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-300
                transition w-8 h-8 flex items-center justify-center
                rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: '⚡', label: 'Fast Access' },
              { icon: '📴', label: 'Works Offline' },
              { icon: '🔔', label: 'Notifications' },
            ].map(f => (
              <div key={f.label}
                className="bg-white/[0.05] rounded-xl p-2.5 text-center">
                <p className="text-lg mb-1">{f.icon}</p>
                <p className="text-gray-400 text-[10px]">{f.label}</p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 py-3 rounded-2xl text-sm font-bold
                text-white bg-gradient-to-r from-purple-600 to-pink-600
                hover:opacity-90 active:scale-[0.98]
                transition-all duration-200 shadow-lg
                shadow-purple-500/30"
            >
              📱 Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 rounded-2xl text-sm text-gray-400
                border border-white/10 hover:border-white/20
                hover:text-white transition"
            >
              Later
            </button>
          </div>

          {/* Install instruction for iOS */}
          <p className="text-gray-600 text-[10px] text-center mt-3">
            iPhone: Tap Share → Add to Home Screen
          </p>
        </div>
      </div>
    </>
  );
}
