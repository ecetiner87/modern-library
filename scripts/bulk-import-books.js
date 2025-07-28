const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const FILE_PATH = path.join(__dirname, '../booklist_remaining.txt');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseCSVFile(content) {
  const lines = [];
  const fileLines = content.split('\n');
  let currentLine = '';
  let inQuotes = false;
  let lineNumber = 0;
  
  for (let i = 0; i < fileLines.length; i++) {
    const line = fileLines[i];
    lineNumber++;
    
    if (!inQuotes) {
      // Start of a new line
      currentLine = line;
      inQuotes = (line.match(/"/g) || []).length % 2 === 1;
    } else {
      // Continue from previous line
      currentLine += '\n' + line;
      inQuotes = (line.match(/"/g) || []).length % 2 === 0;
    }
    
    // If we have a complete line (not in quotes), parse it
    if (!inQuotes && currentLine.trim()) {
      try {
        const bookData = parseCSVLine(currentLine);
        if (bookData && bookData.length === 9) {
          lines.push(bookData);
        } else {
          log(`⚠️  Skipping invalid line ${lineNumber}: ${currentLine.substring(0, 50)}...`, 'yellow');
        }
      } catch (error) {
        log(`⚠️  Error parsing line ${lineNumber}: ${error.message}`, 'yellow');
      }
      currentLine = '';
    }
  }
  
  return lines;
}

function parseCSVLine(line) {
  try {
    // Split by comma and handle quoted fields
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add the last field
    fields.push(currentField.trim());
    
    // Ensure we have exactly 9 fields
    if (fields.length !== 9) {
      return null;
    }
    
    // Remove quotes from each field
    return fields.map(field => field.replace(/^"|"$/g, ''));
  } catch (error) {
    return null;
  }
}

async function getCategoryId(categoryName) {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    const categories = response.data.data;
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.id : null;
  } catch (error) {
    log(`Error fetching categories: ${error.message}`, 'red');
    return null;
  }
}

async function importBook(bookData) {
  try {
    const [title, authorFirstName, authorLastName, price, categoryName, subCategory, publicationYear, translator, readStatus] = bookData;
    
    // Get category ID
    const categoryId = await getCategoryId(categoryName);
    if (!categoryId) {
      log(`Category not found: ${categoryName}`, 'yellow');
      return false;
    }
    
    // Prepare book data
    const bookPayload = {
      title: title.trim(),
      author_first_name: authorFirstName.trim(),
      author_last_name: authorLastName.trim(),
      price: parseFloat(price) || 0,
      category_id: categoryId,
      sub_category: subCategory.trim(),
      publication_year: parseInt(publicationYear) || null,
      translator: translator.trim() || '', // Send empty string instead of null
      pages: null, // Not provided in the file
      description: null, // Not provided in the file
      is_read: readStatus === 'YES',
      rating: readStatus === 'YES' ? 4 : null // Auto 4-star for YES
    };
    
    log(`📤 Sending payload: ${JSON.stringify(bookPayload, null, 2)}`, 'blue');
    
    // Import book
    const response = await axios.post(`${API_BASE_URL}/books`, bookPayload);
    
    if (response.status === 201) {
      const statusText = readStatus === 'YES' ? 'READ (4★)' : 'UNREAD';
      log(`✓ ${title} by ${authorFirstName} ${authorLastName} - ${statusText}`, 'green');
      return true;
    }
    
    return false;
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        log(`✗ Error importing book: ${error.response.data.message}`, 'red');
      } else if (error.response.data.error) {
        log(`✗ Error importing book: ${error.response.data.error}`, 'red');
      } else {
        log(`✗ Error importing book: ${JSON.stringify(error.response.data)}`, 'red');
      }
      log(`📋 Response status: ${error.response.status}`, 'red');
      log(`📋 Response headers: ${JSON.stringify(error.response.headers)}`, 'red');
    } else {
      log(`✗ Error importing book: ${error.message}`, 'red');
    }
    return false;
  }
}

async function bulkImport() {
  try {
    log('📚 Starting bulk import of books...', 'cyan');
    log(`📁 Reading file: ${FILE_PATH}`, 'blue');
    
    // Check if file exists
    if (!fs.existsSync(FILE_PATH)) {
      log(`❌ File not found: ${FILE_PATH}`, 'red');
      return;
    }
    
    // Read file
    const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
    const bookDataArray = parseCSVFile(fileContent);
    
    log(`📖 Found ${bookDataArray.length} valid books to import`, 'blue');
    log('', 'reset');
    
    let successCount = 0;
    let errorCount = 0;
    let readCount = 0;
    let unreadCount = 0;
    
    // Process each book
    for (let i = 0; i < bookDataArray.length; i++) {
      const bookData = bookDataArray[i];
      
      const success = await importBook(bookData);
      if (success) {
        successCount++;
        if (bookData[8] === 'YES') {
          readCount++;
        } else {
          unreadCount++;
        }
      } else {
        errorCount++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    log('', 'reset');
    log('📊 Import Summary:', 'cyan');
    log(`✅ Successfully imported: ${successCount} books`, 'green');
    log(`❌ Failed imports: ${errorCount} books`, 'red');
    log(`📖 Marked as READ (4★): ${readCount} books`, 'blue');
    log(`📚 Marked as UNREAD: ${unreadCount} books`, 'yellow');
    log(`📈 Success rate: ${((successCount / bookDataArray.length) * 100).toFixed(1)}%`, 'magenta');
    
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, 'red');
  }
}

// Run the import
if (require.main === module) {
  bulkImport();
}

module.exports = { bulkImport }; 