// models/index.js
import { Sequelize } from 'sequelize';
import Tag from './Tag.js';
import ProductTag from './ProductTag.js';

const sequelize = new Sequelize('user_tags', 'postgres', 'Psql@13443', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

// Initialize models
const TagModel = Tag(sequelize);
const ProductTagModel = ProductTag(sequelize);

// Set up associations
TagModel.belongsToMany(ProductTagModel, {
  through: 'TagProductMappings',
  foreignKey: 'tagId',
  otherKey: 'productTagId'
});

ProductTagModel.belongsToMany(TagModel, {
  through: 'TagProductMappings',
  foreignKey: 'productTagId',
  otherKey: 'tagId'
});

export { TagModel as Tag, ProductTagModel as ProductTag, sequelize };