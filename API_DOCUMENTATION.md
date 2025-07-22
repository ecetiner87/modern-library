# 📚 Modern Library Management System - API Documentation

## Overview

The Modern Library API provides comprehensive endpoints for managing a personal library system with books, authors, categories, reading history, wishlist, and borrowed books tracking.

**Base URL:** `http://localhost:3001/api`

**Content-Type:** `application/json`

---

## 🔧 Health Check

### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-22T19:15:00.000Z",
  "uptime": 12345
}
```

---

## 📚 Books API

### GET /books
Retrieve all books with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)  
- `search` (optional): Search in title, author, or description
- `category_id` (optional): Filter by category ID
- `is_read` (optional): Filter by read status (true/false)
- `is_wishlist` (optional): Filter wishlist books (true/false)

**Example Request:**
```bash
GET /api/books?search=tom&page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Rubicon",
      "author_first_name": "Tom",
      "author_last_name": "Holland",
      "category_id": 18,
      "category_name": "TARIH",
      "category_color": "#10B981",
      "sub_category": "TARIH",
      "rating": 4,
      "pages": 400,
      "publication_year": 2003,
      "price": 35.00,
      "is_read": true,
      "is_wishlist": false,
      "is_borrowed": false,
      "description": "Roman history masterpiece",
      "created_at": "2025-07-22T19:15:00.000Z",
      "updated_at": "2025-07-22T19:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### GET /books/:id
Retrieve a single book by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Rubicon",
  "author_first_name": "Tom",
  "author_last_name": "Holland",
  "category_name": "TARIH",
  "rating": 4,
  "is_read": true
}
```

### POST /books
Create a new book.

**Request Body:**
```json
{
  "title": "New Book Title",
  "author_first_name": "Author",
  "author_last_name": "Name",
  "category_id": 18,
  "sub_category": "TARIH",
  "pages": 300,
  "publication_year": 2023,
  "price": 45.90,
  "rating": 5,
  "is_read": true,
  "description": "Book description",
  "translator": "Translator Name"
}
```

**Response:**
```json
{
  "message": "Book added successfully!",
  "id": 22
}
```

### PUT /books/:id
Update an existing book.

**Request Body:** Same as POST /books

**Response:**
```json
{
  "message": "Book updated successfully!"
}
```

### DELETE /books/:id
Delete a book.

**Response:**
```json
{
  "message": "Book deleted successfully!"
}
```

### PATCH /books/:id/read
Mark a book as read and add to reading history.

**Request Body:**
```json
{
  "rating": 4,
  "notes": "Great book!",
  "finish_date": "2025-07-22T19:15:00.000Z"
}
```

**Response:**
```json
{
  "message": "Book marked as read and history updated successfully!"
}
```

---

## 👨‍💼 Authors API

### GET /authors/from-books
Retrieve authors aggregated from books with search functionality.

**Query Parameters:**
- `search` (optional): Search by author name

**Response:**
```json
[
  {
    "name": "Tom Holland",
    "book_count": 2,
    "books_read": 1,
    "average_rating": 4.5
  }
]
```

### GET /authors/books/:firstName/:lastName
Get all books by a specific author.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Rubicon",
    "category_name": "TARIH",
    "rating": 4,
    "is_read": true,
    "pages": 400,
    "publication_year": 2003
  }
]
```

---

## 🏷️ Categories API

### GET /categories
Retrieve all categories.

**Response:**
```json
[
  {
    "id": 18,
    "name": "TARIH",
    "description": "Historical books",
    "color": "#10B981"
  }
]
```

### GET /categories/distribution
Get category distribution with subcategories.

**Response:**
```json
[
  {
    "id": 18,
    "name": "TARIH",
    "color": "#10B981",
    "book_count": 9,
    "read_count": 8,
    "subcategories": [
      {
        "sub_category": "TURK POLITIKASI",
        "book_count": 2,
        "read_count": 1
      }
    ]
  }
]
```

### GET /categories/:id/books
Get books in a specific category.

**Query Parameters:**
- `subcategory` (optional): Filter by subcategory

**Response:**
```json
[
  {
    "id": 1,
    "title": "Rubicon",
    "author_first_name": "Tom",
    "author_last_name": "Holland",
    "sub_category": "TARIH",
    "rating": 4,
    "is_read": true
  }
]
```

### GET /sub-categories/:categoryName
Get subcategories for a specific category.

**Response:**
```json
[
  {
    "sub_category": "TARIH"
  },
  {
    "sub_category": "TURK POLITIKASI"
  }
]
```

---

## 📖 Reading History API

### GET /reading-history
Retrieve reading history with pagination.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `year` (optional): Filter by year

**Response:**
```json
[
  {
    "id": 1,
    "book_id": 18,
    "title": "Test Unread Book",
    "author_name": "Test Author",
    "finish_date": "2025-07-22T19:15:00.000Z",
    "rating": 3,
    "notes": "Great book!",
    "pages": null
  }
]
```

---

## ❤️ Wishlist API

### GET /wishlist
Retrieve wishlist items with search.

**Query Parameters:**
- `search` (optional): Search by book name or author

**Response:**
```json
[
  {
    "id": 1,
    "book_name": "Yabanci",
    "author_name": "Albert Camus",
    "publisher": "İletişim Yayınları",
    "price": 25.50,
    "notes": "French existential literature",
    "is_purchased": false,
    "added_date": "2025-07-22T19:15:00.000Z"
  }
]
```

### POST /wishlist
Add a new item to wishlist.

**Request Body:**
```json
{
  "book_name": "Book Title",
  "author_name": "Author Name",
  "publisher": "Publisher Name",
  "price": 35.00,
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "message": "Wish added to wishlist successfully!",
  "id": 6
}
```

### DELETE /wishlist/:id
Remove item from wishlist.

**Response:**
```json
{
  "message": "Wish removed successfully!"
}
```

### PATCH /wishlist/:id/purchase
Mark wishlist item as purchased.

**Response:**
```json
{
  "message": "Wish marked as purchased!"
}
```

### GET /wishlist/stats
Get wishlist statistics.

**Response:**
```json
{
  "total_wishes": 5,
  "pending_wishes": 1,
  "purchased_wishes": 4,
  "total_estimated_value": 560.50
}
```

---

## 📤 Borrowed Books API

### GET /borrowed
Retrieve all borrowed books (active and returned).

**Response:**
```json
[
  {
    "id": 1,
    "book_id": 11,
    "title": "HOSGELDIN EGE",
    "author_name": "Author Name",
    "borrowed_to": "AHMET AHMET",
    "borrowed_on": "2025-07-22",
    "returned": false,
    "returned_on": null,
    "notes": "3 hafta sonra getireceğini söyledi",
    "days_borrowed": 60,
    "is_overdue": true
  }
]
```

### GET /borrowed/available-books
Get books available for lending.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Book Title",
    "author_name": "Author Name"
  }
]
```

### POST /borrowed
Lend a book to someone.

**Request Body:**
```json
{
  "book_id": 1,
  "borrowed_to": "John Doe",
  "borrowed_on": "2025-07-22",
  "notes": "Will return in 2 weeks"
}
```

**Response:**
```json
{
  "message": "Book lent successfully!"
}
```

### PATCH /borrowed/:id/return
Mark a borrowed book as returned.

**Request Body:**
```json
{
  "returned_on": "2025-07-22",
  "notes": "Returned in good condition"
}
```

**Response:**
```json
{
  "message": "Book marked as returned!"
}
```

---

## 📊 Statistics API

### GET /stats
Get dashboard overview statistics.

**Response:**
```json
{
  "total_books": 15,
  "books_read": 11,
  "borrowed_books": 3,
  "total_authors": 12,
  "total_categories": 6,
  "wishlist_stats": {
    "pending_wishes": 1
  },
  "recent_activity": [
    {
      "title": "Frontend Test - Unread Book",
      "author_name": "Frontend Test",
      "finish_date": "2025-07-22T19:15:00.000Z"
    }
  ]
}
```

### GET /stats/category-distribution
Get book distribution across categories.

**Response:**
```json
[
  {
    "category": "TARIH",
    "book_count": 9,
    "read_count": 8
  }
]
```

### GET /stats/reading-progress
Get monthly reading progress.

**Query Parameters:**
- `year` (optional): Year to filter (default: current year)

**Response:**
```json
[
  {
    "month": 1,
    "books_read": 0
  },
  {
    "month": 7,
    "books_read": 11
  }
]
```

### GET /stats/top-authors
Get top authors by book count.

**Query Parameters:**
- `limit` (optional): Number of authors to return (default: 10)

**Response:**
```json
[
  {
    "name": "Test Author",
    "book_count": 3,
    "books_read": 2
  }
]
```

### GET /stats/achievements
Get reading achievements and streaks.

**Response:**
```json
{
  "total_books_read": 11,
  "books_read_last_30_days": 2,
  "average_rating": 4.2,
  "longest_streak": 5
}
```

---

## 🔒 Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Validation Errors
```json
{
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

---

## 📝 Data Validation

### Book Validation Rules
- `title`: Required, string
- `author_first_name`: Optional, string
- `author_last_name`: Optional, string
- `category_id`: Optional, integer
- `pages`: Optional, positive integer
- `publication_year`: Optional, integer between 1000-2030
- `price`: Optional, positive number
- `rating`: Optional, integer between 1-5
- `is_read`: Optional, boolean

### Wishlist Validation Rules
- `book_name`: Required, string
- `author_name`: Required, string
- `publisher`: Optional, string
- `price`: Optional, positive number
- `notes`: Optional, string

### Borrowed Books Validation Rules
- `book_id`: Required, integer (must exist)
- `borrowed_to`: Required, string
- `borrowed_on`: Optional, date (default: today)
- `notes`: Optional, string

---

## 🔄 Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (starting from 1)
- `limit`: Items per page (max 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 🔍 Search & Filtering

### Books Search
The `/api/books` endpoint supports:
- **Text search**: Searches in title, author name, and description
- **Category filtering**: `category_id` parameter
- **Status filtering**: `is_read`, `is_wishlist` parameters
- **Combined filters**: Multiple parameters can be used together

Example:
```bash
GET /api/books?search=tom&category_id=18&is_read=true
```

### Authors Search
The `/api/authors/from-books` endpoint supports:
- **Name search**: Searches in full author names

Example:
```bash
GET /api/authors/from-books?search=holland
```

### Wishlist Search
The `/api/wishlist` endpoint supports:
- **Text search**: Searches in book name and author name

Example:
```bash
GET /api/wishlist?search=camus
```

---

## 🌐 CORS & Headers

The API supports CORS for frontend integration:

**Allowed Origins:** `http://localhost:3000` (development)
**Allowed Methods:** GET, POST, PUT, PATCH, DELETE
**Allowed Headers:** Content-Type, Authorization

---

## 📱 Integration Examples

### JavaScript/React Example
```javascript
// Fetch books
const response = await fetch('/api/books?search=tom');
const data = await response.json();

// Add new book
const newBook = await fetch('/api/books', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Book',
    author_first_name: 'Author',
    author_last_name: 'Name',
    category_id: 18
  })
});
```

### cURL Examples
```bash
# Get all books
curl http://localhost:3001/api/books

# Search books
curl "http://localhost:3001/api/books?search=tom&limit=5"

# Add new book
curl -X POST http://localhost:3001/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","author_first_name":"John","author_last_name":"Doe"}'

# Mark book as read
curl -X PATCH http://localhost:3001/api/books/1/read \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"notes":"Excellent book!"}'
```

---

## 🔧 Database Schema Reference

### Key Tables Structure

#### books
- `id`: Primary key
- `title`: Book title
- `author_first_name`: Author's first name
- `author_last_name`: Author's last name
- `category_id`: Foreign key to categories
- `sub_category`: Subcategory name
- `rating`: 1-5 star rating
- `pages`: Number of pages
- `publication_year`: Year published
- `price`: Book price
- `is_read`: Boolean read status
- `is_wishlist`: Boolean wishlist status
- `is_borrowed`: Boolean borrowed status

#### reading_history
- `id`: Primary key
- `book_id`: Foreign key to books
- `finish_date`: Date finished reading
- `rating`: 1-5 star rating
- `notes`: Reading notes

#### wishlist
- `id`: Primary key
- `book_name`: Wished book name
- `author_name`: Author name
- `publisher`: Publisher name
- `price`: Estimated price
- `is_purchased`: Boolean purchase status

#### borrowed_books
- `id`: Primary key
- `book_id`: Foreign key to books
- `borrowed_to`: Borrower name
- `borrowed_on`: Date borrowed
- `returned`: Boolean return status
- `returned_on`: Date returned

---

## 📋 Rate Limiting

Currently no rate limiting is implemented. For production use, consider implementing:

- **General API**: 100 requests per minute per IP
- **Search endpoints**: 30 requests per minute per IP  
- **POST/PUT/DELETE**: 20 requests per minute per IP

---

## 🔐 Authentication (Future)

The current API does not require authentication. For multi-user support, consider implementing:

- **JWT tokens** for session management
- **Role-based access** (admin, user)
- **API key authentication** for external integrations

---

This API documentation covers all implemented endpoints in the Modern Library Management System. For additional features or clarification, please refer to the source code or contact the development team. 