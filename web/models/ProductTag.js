// models/ProductTag.js
import { DataTypes } from 'sequelize';

const ProductTag = (sequelize) => {
  return sequelize.define('ProductTag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    shopifyProductId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tagId: {  // This needs to match the Tag model's primary key
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tags',  // References the tags table
        key: 'id'
      }
    },
    shopDomain: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'product_tags',  // Explicitly set table name
    timestamps: true,           // Add this if you want created_at and updated_at
    indexes: [
      {
        unique: true,
        fields: ['shopifyProductId', 'tagId', 'shopDomain'],
        name: 'product_tag_unique_constraint'
      }
    ]
  });
};

export default ProductTag;