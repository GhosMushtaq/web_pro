const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Collection = require('../models/Collection');
const User = require('../models/User');

const collections = [
  // Occasion-Based
  { name: 'Birthday Bliss',       emoji: '🎂', description: 'Perfect birthday gifts for everyone', isFeatured: true },
  { name: 'Wedding Wonders',      emoji: '💍', description: 'Celebrate the special union', isFeatured: true },
  { name: 'Anniversary Love',     emoji: '❤️',  description: 'Mark milestones with elegance', isFeatured: true },
  { name: 'Baby Shower Joy',      emoji: '🍼', description: 'Adorable gifts for new arrivals' },
  { name: 'Graduation Glory',     emoji: '🎓', description: 'Celebrate achievements' },
  { name: 'Eid Mubarak',          emoji: '🌙', description: 'Festive Eid gift collections', isFeatured: true },
  { name: "Valentine's Day",      emoji: '💝', description: 'Express your love beautifully', isFeatured: true },
  { name: "Mother's Day Magic",   emoji: '🌸', description: 'Honor the special women in your life' },
  { name: "Father's Day Finds",   emoji: '👔', description: 'Gifts dads actually love' },
  { name: 'New Year Wishes',      emoji: '🎆', description: 'Ring in the new year with gifts' },

  // Recipient-Based
  { name: 'For Her',              emoji: '👩', description: 'Thoughtful gifts for women', isFeatured: true },
  { name: 'For Him',              emoji: '👨', description: 'Gifts crafted for men' },
  { name: 'For Kids',             emoji: '🧸', description: 'Delightful gifts for children' },
  { name: 'For Grandparents',     emoji: '👴', description: 'Show love to elders' },
  { name: 'For Besties',          emoji: '👯', description: 'Celebrate friendship' },
  { name: 'For Boss/Colleague',   emoji: '💼', description: 'Professional gifting done right' },
  { name: 'For Teachers',         emoji: '📚', description: 'Appreciate the educators' },
  { name: 'For Newlyweds',        emoji: '🏠', description: 'Help them build their new home' },

  // Product Type-Based
  { name: 'Luxury Gift Boxes',    emoji: '🎁', description: 'Premium curated gift boxes', isFeatured: true },
  { name: 'Personalized Gifts',   emoji: '✍️',  description: 'Custom name & photo gifts' },
  { name: 'Flower & Chocolate',   emoji: '🌹', description: 'Classic romantic combos' },
  { name: 'Candles & Diffusers',  emoji: '🕯️',  description: 'Aromatherapy & ambiance' },
  { name: 'Jewelry & Accessories',emoji: '💎', description: 'Sparkle and shine' },
  { name: 'Spa & Wellness',       emoji: '🛁', description: 'Relaxation & self-care gifts' },
  { name: 'Snack & Gourmet',      emoji: '🍫', description: 'Delicious food gift baskets' },
  { name: 'Plants & Succulents',  emoji: '🌿', description: 'Living gifts that last' },
  { name: 'Books & Stationery',   emoji: '📖', description: 'For the readers & writers' },
  { name: 'Tech & Gadgets',       emoji: '📱', description: 'Modern gifts for tech lovers' },
  { name: 'Home Décor',           emoji: '🏡', description: 'Beautiful home accessories' },
  { name: 'Art & Prints',         emoji: '🎨', description: 'Framed art & wall decor' },

  // Special
  { name: 'Under Rs. 500',        emoji: '💰', description: 'Budget-friendly thoughtful gifts' },
  { name: 'Premium Collection',   emoji: '⭐', description: 'Our finest luxury offerings', isFeatured: true },
  { name: 'Handmade & Artisan',   emoji: '🤲', description: 'Crafted with love locally' },
  { name: 'Digital Gift Cards',   emoji: '💳', description: 'Let them choose their joy' },
  { name: 'Corporate Gifting',    emoji: '🏢', description: 'Bulk & branded gift solutions' },
  { name: 'Eco-Friendly Gifts',   emoji: '🌱', description: 'Sustainable gifting choices' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Seed Collections
    await Collection.deleteMany({});
    const seededCollections = await Collection.create(
      collections.map((c, i) => ({
        ...c,
        isActive: true,
        sortOrder: i,
        isFeatured: c.isFeatured || false,
      }))
    );
    console.log(`✅ Seeded ${seededCollections.length} collections`);

    // Create admin user
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await User.create({
        name: 'Gifting Bliss Admin',
        email: process.env.ADMIN_EMAIL || 'admin@giftingbliss.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@GiftingBliss123',
        role: 'admin',
        isVerified: true,
        isActive: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n🎁 Gifting Bliss database seeded successfully!');
    console.log(`📦 Collections: ${seededCollections.length}`);
    console.log(`\nAdmin credentials:`);
    console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@giftingbliss.com'}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@GiftingBliss123'}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Run failed completely:', err);
    console.error(err.stack || err.message);
    process.exit(1);
  }
};

seedDB();
