import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstallPrompt } from '../../pwa/usePwaInstallPrompt';

export default function InstallAppBanner() {
  const { isInstallable, promptInstall, dismiss } = usePwaInstallPrompt();

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Install App</p>
          <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={promptInstall} className="flex-shrink-0">
            Install
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss} className="flex-shrink-0 p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
