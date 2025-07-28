import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpenIcon, 
  HomeIcon, 
  UsersIcon, 
  TagIcon, 
  ClockIcon, 
  HeartIcon, 
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Books', href: '/books', icon: BookOpenIcon },
  { name: 'Authors', href: '/authors', icon: UsersIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Currently Reading', href: '/currently-reading', icon: EyeIcon },
  { name: 'Reading History', href: '/reading-history', icon: ClockIcon },
  { name: 'Wishlist', href: '/wishlist', icon: HeartIcon },
  { name: 'Borrowed Books', href: '/borrowed', icon: ArrowRightOnRectangleIcon },
  { name: 'Statistics', href: '/stats', icon: ChartBarIcon },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Mobile sidebar */}
      <div className={clsx('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex w-full max-w-xs flex-1 flex-col ${theme.surface}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex flex-shrink-0 items-center px-4">
              <BookOpenIcon className={`h-8 w-8 ${theme.primary}`} />
              <span className={`ml-2 text-xl font-bold ${theme.text}`}>Modern Library</span>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    location.pathname === item.href
                      ? `${theme.primaryBg} ${theme.primary}`
                      : `${theme.textSecondary} ${theme.sidebarHover} ${theme.text}`,
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto ${theme.sidebar} px-6 ${theme.shadow}`}>
          <div className="flex h-16 shrink-0 items-center">
            <BookOpenIcon className={`h-8 w-8 ${theme.primary}`} />
            <span className={`ml-2 text-xl font-bold ${theme.text}`}>Modern Library</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          location.pathname === item.href
                            ? `${theme.primaryBg} ${theme.primary}`
                            : `${theme.textSecondary} ${theme.sidebarHover} ${theme.primary}`,
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Top bar */}
        <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b ${theme.border} ${theme.surface} px-4 ${theme.shadow} sm:gap-x-6 sm:px-6 lg:px-8`}>
          <button
            type="button"
            className={`-m-2.5 p-2.5 ${theme.textSecondary} lg:hidden`}
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <h1 className={`text-xl font-semibold ${theme.text} py-4`}>
                {navigation.find(item => item.href === location.pathname)?.name || 'Modern Library'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 