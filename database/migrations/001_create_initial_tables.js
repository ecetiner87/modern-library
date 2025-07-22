exports.up = function(knex) {
  return knex.schema
    // Authors table
    .createTable('authors', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('biography');
      table.string('nationality');
      table.date('birth_date');
      table.date('death_date');
      table.timestamps(true, true);
    })
    
    // Categories table
    .createTable('categories', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.text('description');
      table.string('color', 7).defaultTo('#6366f1'); // hex color for UI
      table.timestamps(true, true);
    })
    
    // Books table
    .createTable('books', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.integer('author_id').unsigned().references('id').inTable('authors').onDelete('SET NULL');
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
      table.string('isbn', 13);
      table.text('description');
      table.integer('pages');
      table.date('publication_date');
      table.string('publisher');
      table.string('language').defaultTo('Turkish');
      table.boolean('is_read').defaultTo(false);
      table.boolean('is_wishlist').defaultTo(false);
      table.boolean('is_borrowed').defaultTo(false);
      table.integer('rating').checkBetween([1, 5]);
      table.text('notes');
      table.string('cover_image_url');
      table.date('date_added').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    })
    
    // Reading history table
    .createTable('reading_history', function(table) {
      table.increments('id').primary();
      table.integer('book_id').unsigned().references('id').inTable('books').onDelete('CASCADE');
      table.date('start_date');
      table.date('finish_date');
      table.text('notes');
      table.integer('rating').checkBetween([1, 5]);
      table.timestamps(true, true);
    })
    
    // Borrowed books table
    .createTable('borrowed_books', function(table) {
      table.increments('id').primary();
      table.integer('book_id').unsigned().references('id').inTable('books').onDelete('CASCADE');
      table.string('borrower_name').notNullable();
      table.string('borrower_contact');
      table.date('borrowed_date').notNullable();
      table.date('expected_return_date');
      table.date('actual_return_date');
      table.text('notes');
      table.boolean('is_returned').defaultTo(false);
      table.timestamps(true, true);
    })
    
    // Book authors junction table (for multiple authors per book)
    .createTable('book_authors', function(table) {
      table.increments('id').primary();
      table.integer('book_id').unsigned().references('id').inTable('books').onDelete('CASCADE');
      table.integer('author_id').unsigned().references('id').inTable('authors').onDelete('CASCADE');
      table.unique(['book_id', 'author_id']);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('book_authors')
    .dropTableIfExists('borrowed_books')
    .dropTableIfExists('reading_history')
    .dropTableIfExists('books')
    .dropTableIfExists('categories')
    .dropTableIfExists('authors');
}; 