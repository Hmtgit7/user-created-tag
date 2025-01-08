// models/Tag.js
import { DataTypes } from 'sequelize';

const Tag = (sequelize) => {
  return sequelize.define('Tag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shopDomain: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tags',  // Explicitly set table name
    timestamps: true    // Add this if you want created_at and updated_at
  });
};

export default Tag;