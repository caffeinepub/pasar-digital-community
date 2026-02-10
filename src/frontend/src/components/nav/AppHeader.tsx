import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import AppLogo from '../brand/AppLogo';
import { useGetMyNotifications } from '../../hooks/useNotifications';
import { useIsCallerAdmin } from '../../hooks/useAdmin';
import { Menu, Bell, User, LogOut, Shield, Car, AlertTriangle, Settings, Info } from 'lucide-react';
import { useState } from 'react';

export default function AppHeader() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: notifications } = useGetMyNotifications();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Shield },
    { label: 'Kendaraan Saya', path: '/vehicles', icon: Car },
    { label: 'Kendaraan Hilang', path: '/lost-vehicles', icon: AlertTriangle },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <AppLogo size="small" />
              <span className="font-bold text-lg hidden sm:inline">Pasar Digital Community</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: item.path })}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/admin' })} className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/notifications' })}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Akun Saya</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {identity?.getPrincipal().toString().slice(0, 20)}...
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/security' })}>
                  <Settings className="mr-2 h-4 w-4" />
                  Keamanan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/about' })}>
                  <Info className="mr-2 h-4 w-4" />
                  Tentang
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t py-4 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate({ to: item.path });
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
            {isAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate({ to: '/admin' });
                  setMobileMenuOpen(false);
                }}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
