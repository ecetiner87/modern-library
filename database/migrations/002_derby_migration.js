// Derby to PostgreSQL Migration Script
// Run this after setting up the basic schema

exports.up = async function(knex) {
  // This migration will be populated with your Derby data
  // The actual data import will be handled by the migration script
  console.log('Derby migration placeholder created');
};

exports.down = function(knex) {
  // Rollback would clear imported data
  return knex.schema.raw('TRUNCATE TABLE books, authors, categories RESTART IDENTITY CASCADE');
}; 