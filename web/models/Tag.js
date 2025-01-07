// 2. models/Tag.js
import { DataTypes } from 'sequelize';

const Tag = (sequelize) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    shopDomain: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Tag;
};

export default Tag;