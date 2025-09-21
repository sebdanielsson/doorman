/**
 * User Info Component
 * Displays authenticated user information and provides logout functionality
 * Based on data-model.md UserProfile and component integration requirements
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { User, LogOut, Settings } from 'lucide-react';

interface UserInfoProps {
  className?: string;
}

export function UserInfo({ className }: UserInfoProps) {
  const { state, logout } = useAuth();

  // Don't render if not authenticated
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Logout will still clear local state even if server call fails
    }
  };

  const formatDisplayName = () => {
    if (state.user?.displayName) {
      return state.user.displayName;
    }

    return `Lägenhet ${state.user?.apartmentNumber}`;
  };

  const formatServerInfo = () => {
    try {
      const url = new URL(state.user?.serverAddress || '');
      return url.hostname;
    } catch {
      return state.user?.serverAddress || 'Unknown server';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-2 ${className}`}
          aria-label="User menu"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline-block">{formatDisplayName()}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Profile Section */}
        <div className="px-2 py-1.5">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{formatDisplayName()}</p>
            <p className="text-muted-foreground text-xs">{formatServerInfo()}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <a href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Inställningar
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logga ut
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple user display component for areas where dropdown is not needed
 */
export function UserDisplay({ className }: UserInfoProps) {
  const { state } = useAuth();

  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  const formatDisplayName = () => {
    if (state.user?.displayName) {
      return state.user.displayName;
    }

    return `Lägenhet ${state.user?.apartmentNumber}`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <User className="h-4 w-4" />
      <span>{formatDisplayName()}</span>
    </div>
  );
}

export default UserInfo;
