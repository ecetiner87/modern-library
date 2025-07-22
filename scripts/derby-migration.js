#!/usr/bin/env node

/**
 * Derby to PostgreSQL Migration Script
 * 
 * This script migrates data from Apache Derby database to PostgreSQL
 * Run with: node scripts/derby-migration.js
 */

const derby = require('derby');
const knex = require('knex');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  derby: {
    // Update these paths to match your Derby database location
    databasePath: './derby-db', // Path to your Derby database directory
    driver: 'org.apache.derby.jdbc.EmbeddedDriver',
    // Alternative: if using Derby Network Server
    // url: 'jdbc:derby://localhost:1527/your-database-name'
  },
  postgresql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'modern_library',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  }
};

// Initialize PostgreSQL connection
const pg = knex({
  client: 'postgresql',
  connection: CONFIG.postgresql
});

// Migration statistics
const stats = {
  authors: { processed: 0, created: 0, errors: 0 },
  categories: { processed: 0, created: 0, errors: 0 },
  books: { processed: 0, created: 0, errors: 0 },
  readingHistory: { processed: 0, created: 0, errors: 0 }
};

/**
 * Main migration function
 */
async function migrateFromDerby() {
  try {
    console.log('🚀 Starting Derby to PostgreSQL migration...\n');
    
    // Since Derby integration with Node.js is complex, we'll provide multiple approaches
    console.log('📋 Migration Options:');
    console.log('1. CSV Export/Import (Recommended)');
    console.log('2. JSON Export/Import');
    console.log('3. SQL Export/Import');
    console.log('4. Manual Database Connection (Advanced)\n');
    
    const approach = await promptForApproach();
    
    switch(approach) {
      case '1':
        await csvMigration();
        break;
      case '2':
        await jsonMigration();
        break;
      case '3':
        await sqlMigration();
        break;
      case '4':
        await directDatabaseMigration();
        break;
      default:
        console.log('❌ Invalid option selected');
        process.exit(1);
    }
    
    await printMigrationSummary();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pg.destroy();
  }
}

/**
 * CSV Migration - Export Derby data to CSV, then import to PostgreSQL
 */
async function csvMigration() {
  console.log('📊 CSV Migration Selected');
  console.log('Please follow these steps:\n');
  
  console.log('1. Export your Derby database tables to CSV files:');
  console.log('   - Run this SQL in your Derby database:');
  console.log('   - For each table, use: CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, \'TABLE_NAME\', \'path/to/export.csv\', null, null, null);');
  console.log('');
  
  console.log('2. Expected CSV files (save in ./migration-data/ folder):');
  console.log('   - authors.csv');
  console.log('   - categories.csv');
  console.log('   - books.csv');
  console.log('   - reading_history.csv (if exists)');
  console.log('   - borrowed_books.csv (if exists)');
  console.log('');
  
  // Create migration data directory
  const migrationDir = path.join(__dirname, '..', 'migration-data');
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  // Check if CSV files exist
  const csvFiles = ['authors.csv', 'categories.csv', 'books.csv'];
  const existingFiles = csvFiles.filter(file => 
    fs.existsSync(path.join(migrationDir, file))
  );
  
  if (existingFiles.length === 0) {
    console.log('📝 No CSV files found. Please export your Derby tables first.');
    console.log('Create the files in: ', migrationDir);
    return;
  }
  
  console.log('✅ Found CSV files:', existingFiles.join(', '));
  
  // Process each CSV file
  for (const file of existingFiles) {
    const tableName = file.replace('.csv', '');
    await processCsvFile(path.join(migrationDir, file), tableName);
  }
}

/**
 * JSON Migration - Use JSON export from Derby
 */
async function jsonMigration() {
  console.log('📄 JSON Migration Selected');
  
  const jsonFile = path.join(__dirname, '..', 'migration-data', 'derby-export.json');
  
  if (!fs.existsSync(jsonFile)) {
    console.log('📝 Please create a JSON export file at:', jsonFile);
    console.log('Expected structure:');
    console.log(JSON.stringify({
      authors: [
        { id: 1, name: "Author Name", biography: "Bio", nationality: "Country" }
      ],
      categories: [
        { id: 1, name: "Category Name", description: "Description" }
      ],
      books: [
        { 
          id: 1, 
          title: "Book Title", 
          author_id: 1, 
          category_id: 1,
          isbn: "1234567890",
          pages: 300,
          publication_date: "2020-01-01",
          is_read: true,
          rating: 5
        }
      ]
    }, null, 2));
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  await processJsonData(data);
}

/**
 * SQL Migration - Import from SQL dump
 */
async function sqlMigration() {
  console.log('🗄️ SQL Migration Selected');
  
  const sqlFile = path.join(__dirname, '..', 'migration-data', 'derby-export.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.log('📝 Please create a SQL export file at:', sqlFile);
    console.log('You can generate this using Derby\'s ij tool or database client');
    return;
  }
  
  const sql = fs.readFileSync(sqlFile, 'utf8');
  await processSqlFile(sql);
}

/**
 * Direct Database Migration - Connect to Derby directly
 */
async function directDatabaseMigration() {
  console.log('🔗 Direct Database Migration Selected');
  
  try {
    // This requires Derby JDBC driver and node-java setup
    console.log('⚠️  This method requires additional setup:');
    console.log('1. Install Derby JDBC driver');
    console.log('2. Set up node-java bridge');
    console.log('3. Configure database connection');
    console.log('');
    console.log('For now, please use CSV or JSON export method.');
    
    // Placeholder for direct Derby connection
    // const derbyConnection = await connectToDerby();
    // await migrateDirectly(derbyConnection);
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error);
    console.log('💡 Please use CSV export method instead');
  }
}

/**
 * Process CSV file and import to PostgreSQL
 */
async function processCsvFile(filePath, tableName) {
  console.log(`📊 Processing ${tableName} from CSV...`);
  
  const csv = require('csv-parser');
  const rows = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        try {
          await importTableData(tableName, rows);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

/**
 * Process JSON data and import to PostgreSQL
 */
async function processJsonData(data) {
  console.log('📄 Processing JSON data...');
  
  // Process in order to maintain foreign key relationships
  const order = ['authors', 'categories', 'books', 'reading_history', 'borrowed_books'];
  
  for (const tableName of order) {
    if (data[tableName] && data[tableName].length > 0) {
      await importTableData(tableName, data[tableName]);
    }
  }
}

/**
 * Import data into PostgreSQL table
 */
async function importTableData(tableName, rows) {
  if (!rows || rows.length === 0) {
    console.log(`⚠️  No data found for ${tableName}`);
    return;
  }
  
  console.log(`📥 Importing ${rows.length} records into ${tableName}...`);
  
  try {
    let processedRows = rows.map(row => transformRowForTable(tableName, row));
    
    // Handle different table types
    switch (tableName) {
      case 'authors':
        await importAuthors(processedRows);
        break;
      case 'categories':
        await importCategories(processedRows);
        break;
      case 'books':
        await importBooks(processedRows);
        break;
      case 'reading_history':
        await importReadingHistory(processedRows);
        break;
      case 'borrowed_books':
        await importBorrowedBooks(processedRows);
        break;
      default:
        console.log(`⚠️  Unknown table: ${tableName}`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to import ${tableName}:`, error);
    stats[tableName].errors++;
  }
}

/**
 * Transform row data for specific table
 */
function transformRowForTable(tableName, row) {
  const transformed = {};
  
  // Convert string values to appropriate types
  for (const [key, value] of Object.entries(row)) {
    if (value === '' || value === null || value === 'NULL') {
      transformed[key] = null;
    } else if (key.includes('date') && value) {
      transformed[key] = new Date(value);
    } else if (key === 'pages' || key === 'rating' || key.includes('_id')) {
      transformed[key] = parseInt(value) || null;
    } else if (key.startsWith('is_')) {
      transformed[key] = value === 'true' || value === '1' || value === 1;
    } else {
      transformed[key] = value;
    }
  }
  
  return transformed;
}

/**
 * Import authors with duplicate checking
 */
async function importAuthors(authors) {
  for (const author of authors) {
    try {
      stats.authors.processed++;
      
      // Check for existing author
      const existing = await pg('authors').where('name', author.name).first();
      if (existing) {
        console.log(`⚠️  Author already exists: ${author.name}`);
        continue;
      }
      
      await pg('authors').insert({
        name: author.name || 'Unknown Author',
        biography: author.biography || author.bio || null,
        nationality: author.nationality || null,
        birth_date: author.birth_date || null,
        death_date: author.death_date || null
      });
      
      stats.authors.created++;
      
    } catch (error) {
      console.error(`❌ Failed to import author: ${author.name}`, error);
      stats.authors.errors++;
    }
  }
}

/**
 * Import categories with duplicate checking
 */
async function importCategories(categories) {
  const defaultColors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', 
    '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
  ];
  
  for (const category of categories) {
    try {
      stats.categories.processed++;
      
      // Check for existing category
      const existing = await pg('categories').where('name', category.name).first();
      if (existing) {
        console.log(`⚠️  Category already exists: ${category.name}`);
        continue;
      }
      
      await pg('categories').insert({
        name: category.name || 'Unknown Category',
        description: category.description || null,
        color: category.color || defaultColors[stats.categories.created % defaultColors.length]
      });
      
      stats.categories.created++;
      
    } catch (error) {
      console.error(`❌ Failed to import category: ${category.name}`, error);
      stats.categories.errors++;
    }
  }
}

/**
 * Import books with author/category mapping
 */
async function importBooks(books) {
  for (const book of books) {
    try {
      stats.books.processed++;
      
      // Find or create author
      let authorId = null;
      if (book.author_name || book.author) {
        const authorName = book.author_name || book.author;
        let author = await pg('authors').where('name', authorName).first();
        
        if (!author) {
          // Create new author
          const [newAuthor] = await pg('authors').insert({
            name: authorName,
            biography: null,
            nationality: null
          }).returning('*');
          author = newAuthor;
        }
        
        authorId = author.id;
      }
      
      // Find or create category
      let categoryId = null;
      if (book.category_name || book.category) {
        const categoryName = book.category_name || book.category;
        let category = await pg('categories').where('name', categoryName).first();
        
        if (!category) {
          // Create new category
          const [newCategory] = await pg('categories').insert({
            name: categoryName,
            description: null,
            color: '#6366F1'
          }).returning('*');
          category = newCategory;
        }
        
        categoryId = category.id;
      }
      
      // Insert book
      await pg('books').insert({
        title: book.title || 'Unknown Title',
        author_id: authorId,
        category_id: categoryId,
        isbn: book.isbn || null,
        description: book.description || null,
        pages: book.pages || null,
        publication_date: book.publication_date || null,
        publisher: book.publisher || null,
        language: book.language || 'Turkish',
        is_read: book.is_read || false,
        is_wishlist: book.is_wishlist || false,
        is_borrowed: book.is_borrowed || false,
        rating: book.rating || null,
        notes: book.notes || null,
        cover_image_url: book.cover_image_url || null,
        date_added: book.date_added || new Date()
      });
      
      stats.books.created++;
      
    } catch (error) {
      console.error(`❌ Failed to import book: ${book.title}`, error);
      stats.books.errors++;
    }
  }
}

/**
 * Import reading history
 */
async function importReadingHistory(history) {
  for (const record of history) {
    try {
      stats.readingHistory.processed++;
      
      // Find book by title or ID
      let bookId = null;
      if (record.book_id) {
        const book = await pg('books').where('id', record.book_id).first();
        bookId = book?.id;
      } else if (record.book_title) {
        const book = await pg('books').where('title', record.book_title).first();
        bookId = book?.id;
      }
      
      if (!bookId) {
        console.log(`⚠️  Book not found for reading history: ${record.book_title || record.book_id}`);
        continue;
      }
      
      await pg('reading_history').insert({
        book_id: bookId,
        start_date: record.start_date || null,
        finish_date: record.finish_date || null,
        notes: record.notes || null,
        rating: record.rating || null
      });
      
      stats.readingHistory.created++;
      
    } catch (error) {
      console.error(`❌ Failed to import reading history`, error);
      stats.readingHistory.errors++;
    }
  }
}

/**
 * Import borrowed books
 */
async function importBorrowedBooks(borrowed) {
  for (const record of borrowed) {
    try {
      // Find book by title or ID
      let bookId = null;
      if (record.book_id) {
        const book = await pg('books').where('id', record.book_id).first();
        bookId = book?.id;
      } else if (record.book_title) {
        const book = await pg('books').where('title', record.book_title).first();
        bookId = book?.id;
      }
      
      if (!bookId) {
        console.log(`⚠️  Book not found for borrowed record: ${record.book_title || record.book_id}`);
        continue;
      }
      
      await pg('borrowed_books').insert({
        book_id: bookId,
        borrower_name: record.borrower_name || 'Unknown',
        borrower_contact: record.borrower_contact || null,
        borrowed_date: record.borrowed_date || new Date(),
        expected_return_date: record.expected_return_date || null,
        actual_return_date: record.actual_return_date || null,
        notes: record.notes || null,
        is_returned: record.is_returned || false
      });
      
    } catch (error) {
      console.error(`❌ Failed to import borrowed book`, error);
    }
  }
}

/**
 * Print migration summary
 */
async function printMigrationSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(50));
  
  for (const [table, stat] of Object.entries(stats)) {
    if (stat.processed > 0) {
      console.log(`${table.toUpperCase()}:`);
      console.log(`  Processed: ${stat.processed}`);
      console.log(`  Created: ${stat.created}`);
      console.log(`  Errors: ${stat.errors}`);
      console.log('');
    }
  }
  
  // Get current database counts
  const counts = await Promise.all([
    pg('authors').count('id as count').first(),
    pg('categories').count('id as count').first(),
    pg('books').count('id as count').first(),
    pg('reading_history').count('id as count').first()
  ]);
  
  console.log('📈 CURRENT DATABASE TOTALS:');
  console.log(`  Authors: ${counts[0].count}`);
  console.log(`  Categories: ${counts[1].count}`);
  console.log(`  Books: ${counts[2].count}`);
  console.log(`  Reading History: ${counts[3].count}`);
  console.log('');
  
  console.log('✅ Migration completed successfully!');
  console.log('🌐 You can now access your library at: http://localhost:3000');
}

/**
 * Prompt user for migration approach
 */
async function promptForApproach() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Choose migration approach (1-4): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run migration if this script is executed directly
if (require.main === module) {
  migrateFromDerby();
}

module.exports = {
  migrateFromDerby,
  csvMigration,
  jsonMigration,
  sqlMigration
}; 