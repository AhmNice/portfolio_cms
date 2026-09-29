import { useEffect, useState } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { Menu, X, Search, Bell } from 'lucide-react';
import ThemeToggle from '../util/ThemeToggle';

interface HeaderProps {
  /** Current page title. Pass this from your route/layout instead of hardcoding. */
  title?: string;
  /** Optional one-line context under the title (hidden on small screens). */
  subtitle?: string;
  /** Called when the search field is clicked or Ctrl/Cmd + K is pressed. */
  onSearch?: () => void;
  /** Number of unread notifications. 0 hides the indicator. */
  unreadCount?: number;
  onNotificationsClick?: () => void;
  /** Used for the avatar initials. */
  userName?: string;
  onProfileClick?: () => void;
}

// Shared styles for the round icon buttons so they all behave the same.
const iconButton =
  'inline-flex h-10 w-10 items-center justify-center rounded-full ' +
  'text-on-surface-variant transition-colors motion-reduce:transition-none ' +
  'hover:bg-on-surface/8 active:bg-on-surface/12 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60';

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const Header = ({
  title = 'Dashboard',
  subtitle,
  onSearch,
  unreadCount = 0,
  onNotificationsClick,
  userName = 'User',
  onProfileClick,
}: HeaderProps) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isScrolled, setIsScrolled] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K');

  // Only draw the divider once content actually scrolls under the header.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Show ⌘ on Apple devices, Ctrl elsewhere. Set in an effect to avoid SSR mismatch.
  useEffect(() => {
    if (/Mac|iPhone|iPad/i.test(navigator.userAgent)) setShortcutLabel('⌘ K');
  }, []);

  // Ctrl/Cmd + K opens search.
  useEffect(() => {
    if (!onSearch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onSearch();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSearch]);

  return (
    <header
      className={
        'sticky top-0 z-30 w-full border-b transition-[border-color,background-color] motion-reduce:transition-none ' +
        // Solid fallback first, blur only where the browser supports it.
        'bg-surface-container/95 supports-[backdrop-filter]:bg-surface-container/70 supports-[backdrop-filter]:backdrop-blur-lg ' +
        (isScrolled ? 'border-outline-variant/30' : 'border-transparent')
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: menu button + title */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className={`${iconButton} -ml-2 lg:hidden`}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="min-w-0">
            <h1 className="truncate font-heading text-headline-md font-semibold leading-tight text-on-surface">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden truncate text-sm text-on-surface-variant sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: search, notifications, theme, profile */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Search: full field on desktop, icon on small screens */}
          {onSearch && (
            <>
              <button
                type="button"
                onClick={onSearch}
                className="hidden h-10 w-64 items-center gap-2 rounded-full border border-outline-variant/40 bg-surface/60 px-4 text-sm text-on-surface-variant transition-colors hover:border-outline-variant hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none md:flex"
                aria-label="Search"
              >
                <Search size={16} aria-hidden="true" />
                <span className="flex-1 text-left">Search</span>
                <kbd className="rounded-md border border-outline-variant/40 px-1.5 py-0.5 font-sans text-xs text-on-surface-variant/70">
                  {shortcutLabel}
                </kbd>
              </button>
              <button
                type="button"
                onClick={onSearch}
                className={`${iconButton} md:hidden`}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onNotificationsClick}
            className={`${iconButton} relative`}
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : 'Notifications'
            }
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface-container"
              />
            )}
          </button>

          <ThemeToggle />

          {/* Divider separates page-level tools from the account control */}
          <span
            aria-hidden="true"
            className="mx-1 hidden h-6 w-px bg-outline-variant/40 sm:block"
          />

          <button
            type="button"
            onClick={onProfileClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-on-primary-container transition-shadow hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none"
            aria-label={`Account menu for ${userName}`}
          >
            {getInitials(userName)}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;