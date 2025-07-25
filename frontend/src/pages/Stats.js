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

// Modern color palettes
const COLORS = {
  primary: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
  category: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
};

// Custom components
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-${color}-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
            <span>{trend.positive ? '↑' : '↓'} {trend.value}%</span>
            <span className="ml-1 text-gray-500">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`h-8 w-8 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
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

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

export default function Stats() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Library Analytics
            </h1>
          </div>
          <p className="text-gray-600">Comprehensive insights into your reading journey</p>
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
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
              <div className="text-3xl font-bold text-green-600">
                {stats?.overview?.reading_percentage || 0}%
              </div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </ChartCard>

          {/* Category Distribution */}
          <ChartCard title="🏷️ Books by Category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="book_count"
                  label={({ name, book_count }) => `${name}: ${book_count}`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
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
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <TrophyIcon className="h-6 w-6 text-yellow-600" />
                    <span className="font-medium text-gray-800">Books Read</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats?.overview?.read_books || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <FireIcon className="h-6 w-6 text-red-600" />
                    <span className="font-medium text-gray-800">Reading Streak</span>
                  </div>
                  <span className="font-bold text-red-600">{achievementsData?.data?.current_streak || 0} days</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                    <span className="font-medium text-gray-800">Reading Days</span>
                  </div>
                  <span className="font-bold text-blue-600">{achievementsData?.data?.total_reading_days || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-6 w-6 text-green-600" />
                    <span className="font-medium text-gray-800">Avg Rating</span>
                  </div>
                  <span className="font-bold text-green-600">⭐ {achievementsData?.data?.average_rating || 0}</span>
                </div>
              </div>
            </ChartCard>

            {/* Recent Activity */}
            <ChartCard title="📖 Recent Activity">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {stats?.recent_activity?.map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-800 text-sm">{activity.title}</div>
                    <div className="text-xs text-gray-500">by {activity.author_name}</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {new Date(activity.finish_date.toString().includes('-') ? activity.finish_date : parseInt(activity.finish_date)).toLocaleDateString()}
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    <BookOpenIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
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