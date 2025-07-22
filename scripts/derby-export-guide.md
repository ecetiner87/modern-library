# Apache Derby to PostgreSQL Migration Guide

## 📋 Overview

This guide helps you migrate your 800+ book records from Apache Derby to your new Modern Library PostgreSQL application.

## 🔧 Migration Methods

### Method 1: CSV Export (Recommended) ⭐

This is the most reliable method for migrating your Derby data.

#### Step 1: Locate Your Derby Database

1. Find your Derby database directory (usually named something like `library-db`, `myLibrary`, etc.)
2. Note the full path to this directory

#### Step 2: Connect to Derby and Export Tables

You can use any of these tools to connect to Derby:

**Option A: Using ij (Derby's built-in tool)**

```bash
# Navigate to your Derby installation directory
cd /path/to/derby/bin

# Start ij
./ij

# Connect to your database
ij> connect 'jdbc:derby:/path/to/your/derby-database;';

# List all tables
ij> show tables;

# Export each table to CSV
ij> CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'AUTHORS', '/path/to/modern-library-app/migration-data/authors.csv', null, null, null);
ij> CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'CATEGORIES', '/path/to/modern-library-app/migration-data/categories.csv', null, null, null);
ij> CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'BOOKS', '/path/to/modern-library-app/migration-data/books.csv', null, null, null);

# If you have reading history
ij> CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'READING_HISTORY', '/path/to/modern-library-app/migration-data/reading_history.csv', null, null, null);

# If you have borrowed books tracking
ij> CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'BORROWED_BOOKS', '/path/to/modern-library-app/migration-data/borrowed_books.csv', null, null, null);
```

**Option B: Using DBeaver (GUI Tool)**

1. Download and install DBeaver
2. Create new connection → Apache Derby
3. Set connection URL: `jdbc:derby:/path/to/your/derby-database`
4. Right-click on each table → Export Data → CSV

**Option C: Using SQuirreL SQL**

1. Download and install SQuirreL SQL
2. Add Derby driver
3. Connect to your database
4. Export tables to CSV

#### Step 3: Verify Exported Files

Make sure you have these files in `migration-data/` folder:
- `authors.csv`
- `categories.csv` (if you used categories)
- `books.csv`
- `reading_history.csv` (optional)
- `borrowed_books.csv` (optional)

### Method 2: JSON Export

If CSV export is not working, you can manually create a JSON file:

#### Step 1: Extract Data to JSON

Create a file called `migration-data/derby-export.json` with this structure:

```json
{
  "authors": [
    {
      "id": 1,
      "name": "Agatha Christie",
      "biography": "Mystery writer",
      "nationality": "British"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Mystery",
      "description": "Mystery and detective novels"
    }
  ],
  "books": [
    {
      "id": 1,
      "title": "Murder on the Orient Express",
      "author_name": "Agatha Christie",
      "category_name": "Mystery",
      "isbn": "9780007119318",
      "pages": 256,
      "publication_date": "1934-01-01",
      "description": "Classic mystery novel",
      "is_read": true,
      "rating": 5,
      "date_added": "2023-01-15"
    }
  ],
  "reading_history": [
    {
      "book_title": "Murder on the Orient Express",
      "finish_date": "2023-02-01",
      "rating": 5,
      "notes": "Excellent mystery!"
    }
  ]
}
```

## 📊 Understanding Your Current Derby Structure

Before migration, it's helpful to understand your current database structure. Run these queries in Derby:

```sql
-- Show all tables
SELECT TABLENAME FROM SYS.SYSTABLES WHERE TABLETYPE = 'T';

-- Show structure of books table
DESCRIBE BOOKS;

-- Count records
SELECT COUNT(*) FROM BOOKS;
SELECT COUNT(*) FROM AUTHORS;
SELECT COUNT(*) FROM CATEGORIES;

-- Sample data
SELECT * FROM BOOKS FETCH FIRST 5 ROWS ONLY;
SELECT * FROM AUTHORS FETCH FIRST 5 ROWS ONLY;
```

## 🔄 Common Field Mappings

Your Derby fields likely map to the new schema like this:

### Books Table
| Derby Field | PostgreSQL Field | Notes |
|-------------|------------------|-------|
| ID | id | Primary key |
| TITLE | title | Book title |
| AUTHOR | author_name | Will be mapped to author_id |
| CATEGORY | category_name | Will be mapped to category_id |
| ISBN | isbn | ISBN number |
| PAGES | pages | Page count |
| PUBLICATION_YEAR | publication_date | Year → full date |
| DESCRIPTION | description | Book description |
| IS_READ | is_read | Boolean flag |
| RATING | rating | 1-5 rating |
| DATE_ADDED | date_added | When added to library |

### Authors Table
| Derby Field | PostgreSQL Field |
|-------------|------------------|
| ID | id |
| NAME | name |
| BIO | biography |
| COUNTRY | nationality |

### Categories Table
| Derby Field | PostgreSQL Field |
|-------------|------------------|
| ID | id |
| NAME | name |
| DESCRIPTION | description |

## 🚀 Running the Migration

After you've exported your data:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the migration script:**
   ```bash
   node scripts/derby-migration.js
   ```

3. **Choose migration method:**
   - Option 1: CSV (if you exported CSV files)
   - Option 2: JSON (if you created JSON file)

4. **Monitor progress:**
   The script will show real-time progress and handle:
   - Duplicate authors/categories
   - Data type conversions
   - Missing fields
   - Error reporting

## 🔍 Data Validation

After migration, verify your data:

```bash
# Check record counts
curl http://localhost:3001/api/stats

# Check some books
curl http://localhost:3001/api/books

# Check authors
curl http://localhost:3001/api/authors

# Check categories
curl http://localhost:3001/api/categories
```

## ⚠️ Common Issues and Solutions

### Issue 1: Derby Database Won't Start
```bash
# If Derby database is locked
# 1. Make sure no other applications are using it
# 2. Check for .lck files in database directory and delete them
# 3. Restart Derby
```

### Issue 2: Permission Denied
```bash
# Make sure the export directory exists and is writable
mkdir -p migration-data
chmod 755 migration-data
```

### Issue 3: Character Encoding Issues
- Ensure CSV files are saved in UTF-8 encoding
- Turkish characters should be preserved

### Issue 4: Large Dataset
- For 800+ books, the migration might take a few minutes
- The script processes records in batches for efficiency

## 📈 Expected Migration Results

With 800+ books, you should expect:
- **Authors**: 200-400 unique authors
- **Categories**: 10-30 categories  
- **Books**: 800+ books with full metadata
- **Reading History**: Past reading records (if available)

## 🎯 Next Steps After Migration

1. **Verify Data**: Check a sample of migrated books for accuracy
2. **Add Missing Info**: Use the web interface to add missing book covers, descriptions
3. **Organize Categories**: Refine category organization
4. **Set Reading Goals**: Use the new analytics features
5. **Explore Features**: Try wishlist, borrowed books tracking

## 📞 Need Help?

If you encounter issues:

1. **Check the logs**: The migration script provides detailed error messages
2. **Sample data**: Start with a small subset (10-20 books) to test
3. **Manual entry**: For problematic records, you can add them manually via the web interface
4. **Database reset**: If needed, you can reset and retry:
   ```bash
   npm run reset
   node scripts/derby-migration.js
   ```

## 🔧 Advanced Options

### Custom Field Mapping

If your Derby structure is different, you can modify the migration script:

1. Edit `scripts/derby-migration.js`
2. Update the `transformRowForTable` function
3. Add custom field mappings

### Bulk Import via SQL

For advanced users, you can also import via SQL:

```sql
-- Copy CSV directly to PostgreSQL
COPY authors FROM '/path/to/authors.csv' DELIMITER ',' CSV HEADER;
COPY categories FROM '/path/to/categories.csv' DELIMITER ',' CSV HEADER;
-- etc.
```

---

**Ready to migrate your 800+ books? Let's preserve your reading history in your new modern library! 📚✨** 