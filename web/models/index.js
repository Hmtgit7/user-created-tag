// web/models/index.js - Update with Store model
import { Sequelize } from 'sequelize';
import TagModel from './Tag.js';
import ProductTagModel from './ProductTag.js';
import StoreModel from './Store.js';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/,
      /ECONNRESET/
    ],
    max: 3
  }
});

// Initialize models
const Tag = TagModel(sequelize);
const ProductTag = ProductTagModel(sequelize);
const Store = StoreModel(sequelize);

// Set up associations
Tag.hasMany(ProductTag, {
  foreignKey: 'tagId',
  onDelete: 'CASCADE',
});

ProductTag.belongsTo(Tag, {
  foreignKey: 'tagId',
});

// Add Store associations
Store.hasMany(Tag, {
  foreignKey: 'shopDomain',
  sourceKey: 'shopDomain',
  onDelete: 'CASCADE'
});

Tag.belongsTo(Store, {
  foreignKey: 'shopDomain',
  targetKey: 'shopDomain'
});

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const syncOptions = {
      force: false,
      alter: process.env.NODE_ENV === 'development'
    };

    await sequelize.sync(syncOptions);
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export { Tag, ProductTag, Store, sequelize, initializeDatabase };