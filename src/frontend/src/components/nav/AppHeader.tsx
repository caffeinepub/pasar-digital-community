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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
    { label: 'My Vehicles', path: '/vehicles', icon: Car },
    { label: 'Lost Vehicles', path: '/lost-vehicles', icon: AlertTriangle },
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
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/security' })}>
                  <Settings className="mr-2 h-4 w-4" />
                  Security Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/about' })}>
                  <Info className="mr-2 h-4 w-4" />
                  About
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => {
                        navigate({ to: item.path });
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate({ to: '/admin' });
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
