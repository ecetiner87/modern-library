exports.up = function(knex) {
  return knex.schema.createTable('currently_reading', (table) => {
    table.increments('id').primary();
    table.integer('book_id').unsigned().notNullable();
    table.integer('current_page').unsigned().notNullable();
    table.integer('total_pages').unsigned();
    table.decimal('reading_progress', 5, 2).defaultTo(0); // Percentage (0-100)
    table.timestamp('started_date').defaultTo(knex.fn.now());
    table.timestamp('last_read_date').defaultTo(knex.fn.now());
    table.text('notes').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    // Foreign key constraint
    table.foreign('book_id').references('id').inTable('books').onDelete('CASCADE');
    
    // Ensure one active reading per book
    table.unique(['book_id', 'is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('currently_reading');
}; 