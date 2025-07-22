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

  // Insert authors
  await knex('authors').insert([
    { name: 'Agatha Christie', nationality: 'British', biography: 'Famous mystery writer' },
    { name: 'George Orwell', nationality: 'British', biography: 'Author of 1984 and Animal Farm' },
    { name: 'Victor Hugo', nationality: 'French', biography: 'French romantic writer' },
    { name: 'Fyodor Dostoevsky', nationality: 'Russian', biography: 'Russian novelist and philosopher' },
    { name: 'J.K. Rowling', nationality: 'British', biography: 'Creator of Harry Potter series' },
    { name: 'Stephen King', nationality: 'American', biography: 'Master of horror fiction' },
    { name: 'Isaac Asimov', nationality: 'American', biography: 'Science fiction writer' },
    { name: 'Turkish Authors', nationality: 'Turkish', biography: 'Various Turkish writers' }
  ]);
}; 