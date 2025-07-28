import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon, 
  CheckCircleIcon, 
  HeartIcon, 
  ArrowRightOnRectangleIcon,
  UsersIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { statsApi } from '../services/api';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

const StatCard = ({ title, value, icon: Icon, color = 'indigo' }) => {
  const { theme } = useTheme();
  
  const colorClasses = {
    indigo: `${theme.primaryBg} ${theme.primary}`,
    green: `${theme.successBg} ${theme.success}`,
    red: `${theme.errorBg} ${theme.error}`,
    yellow: `${theme.warningBg} ${theme.warning}`,
    blue: 'bg-blue-50 text-blue-700',
    purple: `${theme.primaryBg} ${theme.primary}`,
    emerald: `${theme.successBg} ${theme.success}`,
  };

  return (
    <div className={`${theme.card} overflow-hidden ${theme.shadow} rounded-lg ${theme.border}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className={`text-sm font-medium ${theme.textMuted} truncate`}>{title}</dt>
              <dd className={`text-2xl font-semibold ${theme.text}`}>{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities = [] }) => {
  const { theme } = useTheme();
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpenIcon className={`mx-auto h-12 w-12 ${theme.textMuted}`} />
        <p className={`mt-2 text-sm ${theme.textMuted}`}>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className={`-my-5 divide-y ${theme.border}`}>
        {activities.map((activity, index) => (
          <li key={index} className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${theme.text} truncate`}>
                  {activity.title}
                </p>
                <p className={`text-sm ${theme.textMuted} truncate`}>
                  by {activity.author_name || 'Unknown Author'}
                </p>
              </div>
              <div className={`flex-shrink-0 text-sm ${theme.textMuted}`}>
                {format(new Date(activity.finish_date), 'MMM d, yyyy')}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsApi.getOverview().then(res => res.data),
  });

  // Quick action handlers
  const handleAddNewBook = () => {
    navigate('/books');
    // Will trigger the add modal when the Books page loads
    setTimeout(() => {
      const addButton = document.querySelector('[data-testid="add-book-button"]');
      if (addButton) addButton.click();
    }, 100);
  };

  const handleMarkBookAsRead = () => {
    navigate('/books');
  };

  const handleViewWishlist = () => {
    navigate('/wishlist');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading dashboard data</p>
      </div>
    );
  }

  const { overview, recent_activity } = stats || {};

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <BookOpenIcon className="h-8 w-8 text-indigo-600" />
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Library</h1>
            <p className="text-gray-600">Track your reading journey and discover new books</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Books"
          value={overview?.total_books || 0}
          icon={BookOpenIcon}
          color="indigo"
        />
        <StatCard
          title="Books Read"
          value={overview?.read_books || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Reading Progress"
          value={`${overview?.reading_percentage || 0}%`}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Total Library Value"
          value={`₺${overview?.total_value || '0.00'}`}
          icon={CurrencyDollarIcon}
          color="emerald"
        />
        <StatCard
          title="Wishlist"
          value={overview?.wishlist_books || 0}
          icon={HeartIcon}
          color="red"
        />
        <StatCard
          title="Borrowed Books"
          value={overview?.borrowed_books || 0}
          icon={ArrowRightOnRectangleIcon}
          color="yellow"
        />
        <StatCard
          title="Authors"
          value={overview?.total_authors || 0}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Categories"
          value={overview?.total_categories || 0}
          icon={TagIcon}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className={`${theme.card} ${theme.shadow} rounded-lg ${theme.border}`}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className={`text-lg leading-6 font-medium ${theme.text} mb-4`}>
            Recent Reading Activity
          </h3>
          <RecentActivity activities={recent_activity} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${theme.card} ${theme.shadow} rounded-lg ${theme.border}`}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className={`text-lg leading-6 font-medium ${theme.text} mb-4`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button 
              onClick={handleAddNewBook}
              className={`relative block w-full rounded-lg border-2 border-dashed ${theme.border} p-6 text-center ${theme.borderHover} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors`}
            >
              <BookOpenIcon className={`mx-auto h-8 w-8 ${theme.textMuted}`} />
              <span className={`mt-2 block text-sm font-medium ${theme.text}`}>
                Add New Book
              </span>
            </button>
            <button 
              onClick={handleMarkBookAsRead}
              className={`relative block w-full rounded-lg border-2 border-dashed ${theme.border} p-6 text-center ${theme.borderHover} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors`}
            >
              <CheckCircleIcon className={`mx-auto h-8 w-8 ${theme.textMuted}`} />
              <span className={`mt-2 block text-sm font-medium ${theme.text}`}>
                Mark Book as Read
              </span>
            </button>
            <button 
              onClick={handleViewWishlist}
              className={`relative block w-full rounded-lg border-2 border-dashed ${theme.border} p-6 text-center ${theme.borderHover} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors`}
            >
              <HeartIcon className={`mx-auto h-8 w-8 ${theme.textMuted}`} />
              <span className={`mt-2 block text-sm font-medium ${theme.text}`}>
                View Wishlist
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 