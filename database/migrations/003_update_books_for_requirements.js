exports.up = function(knex) {
  return knex.schema.alterTable('books', function(table) {
    // Add new fields
    table.string('translator').nullable();
    table.decimal('price', 10, 2).nullable().comment('Price in Turkish Lira');
    table.string('sub_category').nullable();
    table.string('author_first_name').nullable();
    table.string('author_last_name').nullable();
    table.integer('publication_year').nullable();
    
    // Remove old fields
    table.dropColumn('isbn');
    table.dropColumn('publication_date');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('books', function(table) {
    // Remove new fields
    table.dropColumn('translator');
    table.dropColumn('price');
    table.dropColumn('sub_category');
    table.dropColumn('author_first_name');
    table.dropColumn('author_last_name');
    table.dropColumn('publication_year');
    
    // Add back old fields
    table.string('isbn', 13);
    table.date('publication_date');
  });
}; 