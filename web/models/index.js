// // models/index.js
// import { Sequelize } from 'sequelize';
// import TagModel from './Tag.js';
// import ProductTagModel from './ProductTag.js';

// const sequelize = new Sequelize('user_tags', 'postgres', 'Psql@13443', {
//   host: 'localhost',
//   dialect: 'postgres',
//   logging: false
// });

// // Initialize models
// const Tag = TagModel(sequelize);
// const ProductTag = ProductTagModel(sequelize);

// // Set up associations
// Tag.hasMany(ProductTag, {
//   foreignKey: 'tagId',
//   onDelete: 'CASCADE'  // This will delete associated ProductTags when a Tag is deleted
// });

// ProductTag.belongsTo(Tag, {
//   foreignKey: 'tagId'
// });

// // Force sync only in development
// const syncOptions = {
//   force: process.env.NODE_ENV === 'development'  // Be careful with force: true as it drops tables
// };

// const initializeDatabase = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connection established.');

//     // Sync models with database
//     await sequelize.sync(syncOptions);
//     console.log('Database models synchronized.');
//   } catch (error) {
//     console.error('Database initialization error:', error);
//     throw error;
//   }
// };

// export { Tag, ProductTag, sequelize, initializeDatabase };

import { Sequelize } from 'sequelize';
import TagModel from './Tag.js';
import ProductTagModel from './ProductTag.js';
import dotenv from 'dotenv';
dotenv.config();
// Use environment variable or hardcode the database URL
const DATABASE_URL = process.env.DATABASE_URL;

// Initialize Sequelize with the database URL
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
  },
});

// Initialize models
const Tag = TagModel(sequelize);
const ProductTag = ProductTagModel(sequelize);

// Set up associations
Tag.hasMany(ProductTag, {
  foreignKey: 'tagId',
  onDelete: 'CASCADE', // This will delete associated ProductTags when a Tag is deleted
});

ProductTag.belongsTo(Tag, {
  foreignKey: 'tagId',
});

// Force sync only in development
const syncOptions = {
  force: process.env.NODE_ENV === 'development', // Be careful with force: true as it drops tables
};

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models with database
    await sequelize.sync(syncOptions);
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export { Tag, ProductTag, sequelize, initializeDatabase };
