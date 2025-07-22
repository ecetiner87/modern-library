exports.up = function(knex) {
  return knex.schema.createTable('wishlist', function(table) {
    table.increments('id').primary();
    table.string('book_name').notNullable();
    table.string('author_name').notNullable();
    table.text('notes').nullable();
    table.decimal('price', 10, 2).nullable().comment('Price in Turkish Lira if known');
    table.string('publisher').nullable();
    table.boolean('is_purchased').defaultTo(false);
    table.date('added_date').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('wishlist');
}; 