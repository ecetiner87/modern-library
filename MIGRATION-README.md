# 🚀 Derby Migration Quick Start

## 📋 Your Goal
Migrate 800+ book records from Apache Derby to your new Modern Library PostgreSQL app.

## ⚡ Quick Steps

### 1. Export Your Derby Data

**Choose the easiest method for you:**

#### Method A: CSV Export (Recommended)
1. **Find your Derby database** (probably in your Java app folder)
2. **Use a database tool** to export tables to CSV:
   - DBeaver (free GUI tool) - easiest option
   - Derby's `ij` command line tool
   - Any database client that supports Derby

3. **Export these tables** to `migration-data/` folder:
   ```
   migration-data/
   ├── authors.csv
   ├── categories.csv
   ├── books.csv
   └── reading_history.csv (optional)
   ```

#### Method B: JSON Export
Create `migration-data/derby-export.json` with your data structure.

### 2. Run the Migration

```bash
# Install dependencies (if not done already)
npm install

# Run the migration script
npm run migrate:derby

# Or directly:
node scripts/derby-migration.js
```

### 3. Choose Your Method
The script will ask you to choose:
1. CSV Export/Import (if you have CSV files)
2. JSON Export/Import (if you have JSON file)
3. SQL Export/Import (for SQL dumps)
4. Direct database connection (advanced)

### 4. Verify Results
```bash
# Check your migrated data
curl http://localhost:3001/api/stats
curl http://localhost:3001/api/books
```

## 📄 Sample CSV Format

Your `books.csv` should look like this:
```csv
id,title,author_name,category_name,isbn,pages,publication_date,description,is_read,rating
1,"Murder on the Orient Express","Agatha Christie","Mystery","9780007119318",256,"1934-01-01","Classic mystery",true,5
2,"1984","George Orwell","Fiction","9780451524935",328,"1949-06-08","Dystopian novel",true,5
```

## 🔧 Tools for Derby Export

### DBeaver (Recommended)
1. Download: https://dbeaver.io/download/
2. Connect to Derby: `jdbc:derby:/path/to/your/derby-db`
3. Right-click table → Export Data → CSV

### Derby ij Tool
```bash
cd /path/to/derby/bin
./ij
ij> connect 'jdbc:derby:/path/to/your/database';
ij> CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'BOOKS', '/path/to/books.csv', null, null, null);
```

## ⚠️ Before You Start

1. **Make sure your new app is running**: `docker-compose ps`
2. **Backup your Derby database** (just in case)
3. **Find your Derby database location**

## 🎯 Expected Results

After migration, you should have:
- ✅ All 800+ books imported
- ✅ Authors automatically created/linked
- ✅ Categories organized
- ✅ Reading status preserved
- ✅ All metadata (ISBN, pages, ratings) intact

## 📞 Need Help?

1. **Check the detailed guide**: `scripts/derby-export-guide.md`
2. **View sample data**: `migration-data/books-sample.csv`
3. **Test with small dataset first** (10-20 books)

---

**Ready to migrate? Your 800+ books are waiting! 📚✨**

```bash
npm run migrate:derby
``` 