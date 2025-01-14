// web/models/Store.js
import { DataTypes } from 'sequelize';

const Store = (sequelize) => {
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
            allowNull: true  // Allow null initially as token is set after OAuth
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        installedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        scopes: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('scopes');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                this.setDataValue('scopes', JSON.stringify(value));
            }
        }
    }, {
        tableName: 'stores',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['shopDomain']
            }
        ]
    });
};

export default Store;