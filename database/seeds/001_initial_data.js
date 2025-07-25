exports.seed = async function(knex) {
  // Clear existing data
  await knex('book_authors').del();
  await knex('borrowed_books').del();
  await knex('reading_history').del();
  await knex('books').del();
  await knex('categories').del();
  await knex('authors').del();

  // Insert categories
  await knex('categories').insert([
    { name: 'EDEBIYAT', description: 'Edebiyat ve yazın eserleri', color: '#3B82F6' },
    { name: 'TARIH', description: 'Tarih ve sosyal bilimler', color: '#10B981' },
    { name: 'DIN-MITOLOJI', description: 'Din, tasavvuf ve mitoloji', color: '#8B5CF6' },
    { name: 'FELSEFE', description: 'Felsefe ve düşünce tarihi', color: '#F59E0B' },
    { name: 'HOBI', description: 'Hobi ve yaşam tarzı', color: '#EF4444' },
    { name: 'BILIM ve SANAT', description: 'Bilim, teknoloji ve sanat', color: '#6366F1' }
  ]);
}; 