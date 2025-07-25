# 📚 Modern Library Management System

> A comprehensive web-based library management system built with modern technologies. Transform your personal library into a powerful, interactive digital experience!

![Dashboard Screenshot](docs/images/dashboard-overview.png)

## ✨ Key Features

### 📊 **Smart Dashboard**
- **Real-time Statistics**: Track total books, reading progress, authors, and categories
- **Reading Status Overview**: Visual pie chart of read vs unread books
- **Category Distribution**: See your library organized by genres
- **Recent Reading Activity**: Chronological list of recently finished books
- **Quick Actions**: Fast access to add books, mark as read, view wishlist

### 📚 **Complete Book Management**
- **Add Books**: Rich form with categories, subcategories, ratings, and metadata
- **Smart Search**: Real-time search across titles, authors, and descriptions
- **Status Tracking**: Mark books as read/unread with ratings and completion dates
- **Categories & Subcategories**: Organize books by genre (History, Literature, Science, etc.)
- **Reading Progress**: Track your completion rate with visual indicators

### 👨‍💼 **Author Management**
- **Author Profiles**: View all authors with book counts and average ratings
- **Search Functionality**: Find authors quickly with debounced search
- **Author Details**: See all books by specific authors with reading status
- **Dynamic Updates**: Authors are automatically created from book data

### 🏷️ **Category System**
- **Visual Organization**: Color-coded categories with progress bars
- **Subcategory Support**: Detailed classification (e.g., TARIH → Türk Politikası)
- **Reading Progress**: Track completion rate per category
- **Category Filtering**: Filter books by category and subcategory

### 📖 **Reading History**
- **Complete Timeline**: Chronological history of all finished books
- **Ratings & Notes**: Track your thoughts and ratings for each book
- **Reading Statistics**: See your reading patterns over time

### ❤️ **Smart Wishlist**
- **Book Tracking**: Maintain a wishlist of books you want to read
- **Price Comparison**: Integration with Cimri.com for price checking
- **Purchase Tracking**: Mark items as purchased
- **Publisher & Price Info**: Store additional metadata for wishlist items

### 📤 **Borrowed Books Tracking**
- **Lending Management**: Track books you've lent to others
- **Overdue Alerts**: Visual alerts for books borrowed over 60 days (red flag)
- **Return Tracking**: Mark books as returned with dates
- **Borrower Information**: Store notes and contact details

### 📈 **Advanced Analytics**
- **Reading Progress Charts**: Visual representation of monthly reading habits
- **Category Distribution**: Interactive pie charts showing library composition
- **Top Authors**: Modern card-based display of most-read authors
- **Achievement Tracking**: Reading streaks, goals, and milestones

## 🖼️ Screenshots

### Dashboard Overview
![Dashboard](docs/images/dashboard-overview.png)
*Smart dashboard with statistics, recent activity, and quick actions*

### Books Management
![Books Management](docs/images/books-management.png)
*Comprehensive book management with search and filtering*

### Add Book Modal
![Add Book](docs/images/add-book-modal.png)
*Rich form for adding new books with all metadata*

### Authors Section
![Authors](docs/images/authors-section.png)
*Author management with search and book details*

### Categories Overview
![Categories](docs/images/categories-overview.png)
*Visual category organization with progress tracking*

### Category Details
![Category Details](docs/images/categories-details.png)
*Detailed view of books within specific categories*

### Reading History
![Reading History](docs/images/reading-history.png)
*Complete reading timeline with ratings and notes*

### Wishlist Management
![Wishlist](docs/images/wishlist-management.png)
*Smart wishlist with price comparison integration*

### Borrowed Books Tracking
![Borrowed Books](docs/images/borrowed-books.png)
*Track lent books with overdue alerts*

### Statistics Dashboard
![Statistics](docs/images/statistics-dashboard.png)
*Advanced analytics with interactive charts*

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database for production (SQLite for development)
- **Knex.js** for database migrations and queries
- **Express-validator** for input validation
- **CORS** and security middleware

### Frontend
- **React 18** with modern hooks and functional components
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Tailwind CSS** for modern, responsive styling
- **Heroicons** for consistent iconography
- **Recharts** for interactive data visualization
- **Date-fns** for date formatting

### Features
- **Real-time Search** with debouncing
- **Responsive Design** for all screen sizes
- **Modern UI Components** with animations and transitions
- **Custom Modal System** replacing browser alerts
- **Toast Notifications** for user feedback
- **Advanced Charts** for data visualization

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** ✅
- **npm 8+** ✅
- **Docker & Docker Compose** (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ecetiner87/modern-library.git
   cd modern-library
   ```

2. **Setup environment**
   ```bash
   # Copy environment configuration
   cp env.example .env
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

4. **Setup database**
   ```bash
   # Run database migrations
   npm run migrate
   
   # Seed initial data (categories)
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start backend
   npm start
   
   # Terminal 2: Start frontend
   cd frontend && npm start
   ```

6. **Access your library**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## 🚀 Production Deployment

### Quick Production Setup with Docker

For production deployment with Docker and PostgreSQL:

```bash
# 1. Setup production environment
cp env.production.example .env.production
# Edit .env.production with your secure values

# 2. Build and start with Docker Compose
docker compose up -d

# 3. Access your production application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/api
```

### Manual Production Setup

1. **Setup PostgreSQL database**
2. **Configure environment variables**
3. **Run migrations and seeds**
4. **Build frontend for production**
5. **Start with PM2 or similar process manager**

📖 **Detailed Guide:** See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete production setup instructions.

## 📁 Project Structure

```
modern-library/
├── routes/              # API endpoints
│   ├── books.js         # Book management
│   ├── authors.js       # Author operations
│   ├── categories.js    # Category system
│   ├── reading-history.js # Reading tracking
│   ├── wishlist.js      # Wishlist management
│   ├── borrowed.js      # Borrowed books
│   └── stats.js         # Analytics & statistics
├── database/            # Database layer
│   ├── migrations/      # Database schema
│   └── seeds/           # Initial data
├── frontend/
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Main application pages
│       │   ├── Dashboard.js    # Main dashboard
│       │   ├── Books.js        # Book management
│       │   ├── Authors.js      # Author section
│       │   ├── Categories.js   # Category browser
│       │   ├── ReadingHistory.js # Reading timeline
│       │   ├── Wishlist.js     # Wishlist management
│       │   ├── BorrowedBooks.js # Borrowed tracking
│       │   └── Stats.js        # Analytics dashboard
│       └── services/    # API integration
└── docs/
    └── images/          # Screenshots and documentation
```

## 📊 API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

### Key Endpoints
- `GET /api/books` - Retrieve books with search and pagination
- `POST /api/books` - Add new books
- `PATCH /api/books/:id/read` - Mark books as read
- `GET /api/authors/from-books` - Get authors with statistics
- `GET /api/categories/distribution` - Category analytics
- `GET /api/reading-history` - Reading timeline
- `GET /api/wishlist` - Wishlist management
- `GET /api/borrowed` - Borrowed books tracking
- `GET /api/stats` - Dashboard statistics

## 🎯 Key Features in Detail

### Smart Book Management
- **Rating System**: 1-5 star ratings with visual display
- **Reading Status**: Clear visual indicators for read/unread books
- **Publication Details**: Track pages, publication year, price, translator
- **Categories**: Multi-level categorization with colors
- **Search**: Real-time search across all book metadata

### Advanced Analytics
- **Reading Progress**: Monthly/yearly reading statistics
- **Category Distribution**: Visual breakdown of your library
- **Author Statistics**: Most-read authors with modern card design
- **Achievement System**: Track reading streaks and milestones

### Modern UI/UX
- **Responsive Design**: Works perfectly on desktop and mobile
- **Modern Color Scheme**: Beautiful gradients and consistent styling
- **Interactive Elements**: Hover effects, animations, and transitions
- **Accessibility**: Screen reader friendly with proper ARIA labels
- **Performance**: Optimized loading with React Query caching

### External Integrations
- **Cimri.com Price Comparison**: Direct links to compare book prices
- **Future Ready**: Extensible for Goodreads, Google Books API integration

## 🔧 Configuration

### Environment Variables
```bash
# Database Configuration
DB_CLIENT=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend Configuration (built-in proxy)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the love of reading and knowledge management
- Special thanks to the open-source community

---

**Ready to transform your library?** 🚀 Start your journey with the Modern Library Management System today!
