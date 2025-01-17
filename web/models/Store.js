// // models/Store.js
// import { DataTypes } from 'sequelize';

// const Store = (sequelize) => {
//     return sequelize.define('Store', {
//         id: {
//             type: DataTypes.UUID,
//             defaultValue: DataTypes.UUIDV4,
//             primaryKey: true
//         },
//         shopDomain: {
//             type: DataTypes.STRING,
//             allowNull: false,
//             unique: true
//         },
//         accessToken: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         isInstalled: {
//             type: DataTypes.BOOLEAN,
//             defaultValue: true
//         },
//         installedAt: {
//             type: DataTypes.DATE,
//             defaultValue: DataTypes.NOW
//         },
//         uninstalledAt: {
//             type: DataTypes.DATE,
//             allowNull: true
//         }
//     }, {
//         tableName: 'stores',
//         timestamps: true
//     });
// };

// export default Store;

// models/Store.js
import { DataTypes } from 'sequelize';

const StoreModel = (sequelize) => {
  return sequelize.define('Store', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    shopDomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isInstalled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    installedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    uninstalledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'stores',
    timestamps: true
  });
};

export default StoreModel;