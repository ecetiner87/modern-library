import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  ChartBarIcon,
  BookOpenIcon,
  CheckCircleIcon,
  HeartIcon,
  UsersIcon,
  TagIcon,
  TrophyIcon,
  FireIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { statsApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

// Modern color palettes
const COLORS = {
  primary: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
  category: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
};

// Custom components
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
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

  const getIconBgColor = (colorName) => {
    switch (colorName) {
      case 'indigo':
      case 'purple':
        return theme.primaryBg.replace('bg-', 'bg-').replace('50', '100');
      case 'green':
      case 'emerald':
        return theme.successBg.replace('bg-', 'bg-').replace('50', '100');
      case 'red':
        return theme.errorBg.replace('bg-', 'bg-').replace('50', '100');
      case 'yellow':
        return theme.warningBg.replace('bg-', 'bg-').replace('50', '100');
      case 'blue':
        return 'bg-blue-100';
      default:
        return theme.primaryBg.replace('bg-', 'bg-').replace('50', '100');
    }
  };

  const getTextColor = (colorName) => {
    switch (colorName) {
      case 'indigo':
      case 'purple':
        return theme.primary;
      case 'green':
      case 'emerald':
        return theme.success;
      case 'red':
        return theme.error;
      case 'yellow':
        return theme.warning;
      case 'blue':
        return 'text-blue-700';
      default:
        return theme.primary;
    }
  };

  return (
    <div className={`${theme.card} rounded-2xl ${theme.shadow} hover:${theme.shadowHover} transition-all duration-300 p-6 ${theme.border} ${theme.borderHover}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${theme.textSecondary} mb-1`}>{title}</p>
          <p className={`text-3xl font-bold ${getTextColor(color)} mb-1`}>{value}</p>
          {subtitle && <p className={`text-sm ${theme.textMuted}`}>{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'} {trend.value}%</span>
              <span className={`ml-1 ${theme.textMuted}`}>vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getIconBgColor(color)}`}>
          <Icon className={`h-8 w-8 ${getTextColor(color)}`} />
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  const { theme } = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <div className={`${theme.modal} p-4 rounded-lg ${theme.shadow} ${theme.border}`}>
        <p className={`font-semibold ${theme.text}`}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, children, className = "" }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme.card} rounded-2xl ${theme.shadow} p-6 ${theme.border} ${className}`}>
      <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>{title}</h3>
      {children}
    </div>
  );
};

export default function Stats() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { theme } = useTheme();

  // Fetch all statistics data from the main stats endpoint
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsApi.getOverview(),
  });

  const { data: progressData, isLoading: loadingProgress } = useQuery({
    queryKey: ['stats-progress', selectedYear],
    queryFn: () => statsApi.getReadingProgress({ year: selectedYear }),
  });

  const { data: authorsData, isLoading: loadingAuthors } = useQuery({
    queryKey: ['stats-authors'],
    queryFn: () => statsApi.getTopAuthors(),
  });

  const { data: achievementsData, isLoading: loadingAchievements } = useQuery({
    queryKey: ['stats-achievements'],
    queryFn: () => statsApi.getAchievements(),
  });

  if (loadingStats) {
    return (
      <div className={`min-h-screen ${theme.background} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className={`h-8 ${theme.surface} rounded w-1/4 mb-8`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-32 ${theme.surface} rounded-2xl`}></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-80 ${theme.surface} rounded-2xl`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = statsData?.data;
  
  // Prepare data for charts
  const readingData = [
    { name: 'Read', value: stats?.overview?.read_books || 0, color: '#10B981' },
    { name: 'Not Read', value: (stats?.overview?.total_books || 0) - (stats?.overview?.read_books || 0), color: '#EF4444' }
  ];

  // Use category_stats from the main stats endpoint
  const categories = (stats?.category_stats || []).map((cat, index) => ({
    name: cat.name,
    book_count: cat.value,
    color: cat.color || COLORS.category[index % COLORS.category.length]
  }));

  const monthlyData = progressData?.data?.monthly_data?.map((item, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item.month - 1],
    books: item.books_read
  })) || [];

  const topAuthors = authorsData?.data?.slice(0, 5) || [];

  return (
    <div className={`min-h-screen ${theme.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${theme.primaryBg}`}>
              <ChartBarIcon className={`h-8 w-8 ${theme.primary}`} />
            </div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>
              Library Analytics
            </h1>
          </div>
          <p className={`${theme.textSecondary}`}>Comprehensive insights into your reading journey</p>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Books"
            value={stats?.overview?.total_books || 0}
            subtitle="In your library"
            icon={BookOpenIcon}
            color="blue"
          />
          <StatCard
            title="Books Read"
            value={stats?.overview?.read_books || 0}
            subtitle={`${stats?.overview?.reading_percentage || 0}% completion`}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Wishlist"
            value={stats?.overview?.wishlist_books || 0}
            subtitle="Books to read"
            icon={HeartIcon}
            color="pink"
          />
          <StatCard
            title="Authors"
            value={stats?.overview?.total_authors || 0}
            subtitle="Unique authors"
            icon={UsersIcon}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reading Progress Chart */}
          <ChartCard title="📈 Reading Progress This Year" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`px-3 py-2 ${theme.input} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                <XAxis dataKey="month" stroke={theme.chart.text} />
                <YAxis stroke={theme.chart.text} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="books" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBooks)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Reading vs Not Read */}
          <ChartCard title="📚 Reading Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={readingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {readingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <div className={`text-3xl font-bold ${theme.success}`}>
                {stats?.overview?.reading_percentage || 0}%
              </div>
              <div className={`text-sm ${theme.textMuted}`}>Completion Rate</div>
            </div>
          </ChartCard>

          {/* Category Distribution */}
          <ChartCard title="🏷️ Books by Category">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="book_count"
                  labelLine={false}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{
                    paddingLeft: '20px',
                    fontSize: '12px'
                  }}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 'bold' }}>
                      {value}: {entry.payload.book_count}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Authors */}
          <ChartCard title="👥 Top Authors" className="lg:col-span-2">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {topAuthors.map((author, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {author.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpenIcon className="h-4 w-4 mr-1" />
                          {author.book_count} book{author.book_count !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {author.books_read} read
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {author.book_count}
                      </div>
                      <div className="text-xs text-gray-500">total books</div>
                    </div>
                  </div>
                </div>
              ))}
              {topAuthors.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No authors found</p>
                  <p className="text-sm">Start adding books to see your top authors</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Quick Stats */}
          <div className="space-y-4">
            <ChartCard title="🏆 Achievements">
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-3 ${theme.warningBg} rounded-lg ${theme.border}`}>
                  <div className="flex items-center gap-3">
                    <TrophyIcon className={`h-6 w-6 ${theme.warning}`} />
                    <span className={`font-medium ${theme.text}`}>Books Read</span>
                  </div>
                  <span className={`font-bold ${theme.warning}`}>{stats?.overview?.read_books || 0}</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 ${theme.errorBg} rounded-lg ${theme.border}`}>
                  <div className="flex items-center gap-3">
                    <FireIcon className={`h-6 w-6 ${theme.error}`} />
                    <span className={`font-medium ${theme.text}`}>Reading Streak</span>
                  </div>
                  <span className={`font-bold ${theme.error}`}>{achievementsData?.data?.current_streak || 0} days</span>
                </div>

                <div className={`flex items-center justify-between p-3 ${theme.primaryBg} rounded-lg ${theme.border}`}>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className={`h-6 w-6 ${theme.primary}`} />
                    <span className={`font-medium ${theme.text}`}>Reading Days</span>
                  </div>
                  <span className={`font-bold ${theme.primary}`}>{achievementsData?.data?.total_reading_days || 0}</span>
                </div>

                <div className={`flex items-center justify-between p-3 ${theme.successBg} rounded-lg ${theme.border}`}>
                  <div className="flex items-center gap-3">
                    <ClockIcon className={`h-6 w-6 ${theme.success}`} />
                    <span className={`font-medium ${theme.text}`}>Avg Rating</span>
                  </div>
                  <span className={`font-bold ${theme.success}`}>⭐ {achievementsData?.data?.average_rating || 0}</span>
                </div>
              </div>
            </ChartCard>

            {/* Recent Activity */}
            <ChartCard title="📖 Recent Activity">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {stats?.recent_activity?.map((activity, index) => (
                  <div key={index} className={`p-3 ${theme.background} rounded-lg ${theme.border}`}>
                    <div className={`font-medium ${theme.text} text-sm`}>{activity.title}</div>
                    <div className={`text-xs ${theme.textMuted}`}>by {activity.author_name}</div>
                    <div className={`text-xs ${theme.primary} mt-1`}>
                      {new Date(activity.finish_date.toString().includes('-') ? activity.finish_date : parseInt(activity.finish_date)).toLocaleDateString()}
                    </div>
                  </div>
                )) || (
                  <div className={`text-center ${theme.textMuted} py-8`}>
                    <BookOpenIcon className={`h-8 w-8 mx-auto mb-2 ${theme.textMuted}`} />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
} 