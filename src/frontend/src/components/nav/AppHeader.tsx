import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useProfile';
import { useIsCallerAdmin } from '../../hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Shield, Bell, Car, Home, Search, Settings } from 'lucide-react';
import AppLogo from '../brand/AppLogo';
import { useQueryClient } from '@tanstack/react-query';

export default function AppHeader() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, error: adminError } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'My Vehicles', path: '/vehicles', icon: Car },
    { label: 'Lost Vehicles', path: '/lost-vehicles', icon: Search },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  // Show admin link based on admin status (not profile presence)
  // Admin status is determined by backend checks including allowlisted admin
  if ((adminFetched && isAdmin) || (adminError && !adminLoading)) {
    navItems.push({ 
      label: adminError ? 'Admin (Retry)' : 'Admin', 
      path: '/admin', 
      icon: Shield 
    });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2">
            <AppLogo size="small" />
            <span className="font-bold text-lg hidden sm:inline">Pasar Digital</span>
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
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.fullName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.email || identity?.getPrincipal().toString().slice(0, 20) + '...'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/security' })}>
                <Settings className="mr-2 h-4 w-4" />
                Security Settings
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
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex flex-col space-y-1 pb-4 border-b">
                  <p className="text-sm font-medium">
                    {userProfile?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.email || identity?.getPrincipal().toString().slice(0, 20) + '...'}
                  </p>
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="justify-start gap-2"
                      onClick={() => {
                        navigate({ to: item.path });
                        setMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                <div className="border-t pt-4 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => {
                      navigate({ to: '/profile' });
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => {
                      navigate({ to: '/security' });
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Security Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
