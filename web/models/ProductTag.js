// 3. models/ProductTag.js
import { DataTypes } from 'sequelize';


const ProductTag = (sequelize) => {
  const ProductTag = sequelize.define('ProductTag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    shopifyProductId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    shopDomain: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['shopifyProductId', 'shopDomain']
      }
    ]
  });

  return ProductTag;
};

export default ProductTag;