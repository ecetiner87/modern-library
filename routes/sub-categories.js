const express = require('express');
const router = express.Router();

// Sub-categories mapping
const SUB_CATEGORIES = {
  'EDEBIYAT': [
    'ROMAN',
    'SIIR',
    'OYKU',
    'DENEME',
    'INCELEME',
    'BIYOGRAFI',
    'DUNYA KLASIKLERI',
    'TURK KLASIKLERI'
  ],
  'TARIH': [
    'TURK POLITIKASI',
    'DUNYA POLITIKASI',
    'TARIH',
    'SOSYOLOJI',
    'ARASTIRMA',
    'TARIHI KISILER',
    'GAZETECILIK'
  ],
  'DIN-MITOLOJI': [
    'TASAVVUF',
    'ISLAMIYET',
    'MEZHEPLER',
    'MITOLOJI',
    'DIN ADAMLARI',
    'DIGER DINLER'
  ],
  'FELSEFE': [
    'FELSEFE BILIMI',
    'FILOZOFLAR'
  ],
  'HOBI': [
    'YEMEK',
    'SPOR',
    'PSIKOLOJI',
    'HAYVANLAR',
    'BITKILER',
    'MODA',
    'ASTROLOJI',
    'RESIM'
  ],
  'BILIM ve SANAT': [
    'POPULER BILIM',
    'BILIM TARIHI',
    'BILIM INSANLARI',
    'SINEMA',
    'MUZIK',
    'TIYATRO',
    'SANAT TARIHI',
    'MIMARI',
    'FOTOGRAF',
    'SANATCILAR'
  ]
};

// Get all sub-categories for a specific category
router.get('/:category', async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    
    if (!SUB_CATEGORIES[category]) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subCategories = SUB_CATEGORIES[category].map(subCat => ({
      name: subCat,
      value: subCat
    }));

    res.json(subCategories);
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    res.status(500).json({ error: 'Failed to fetch sub-categories' });
  }
});

// Get all sub-categories
router.get('/', async (req, res) => {
  try {
    res.json(SUB_CATEGORIES);
  } catch (error) {
    console.error('Error fetching all sub-categories:', error);
    res.status(500).json({ error: 'Failed to fetch sub-categories' });
  }
});

module.exports = router; 