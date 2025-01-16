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
            unique: true,
            validate: {
                isLowercase: true,
                notEmpty: true
            }
        },
        accessToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        installedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        uninstalledAt: {  // New field
            type: DataTypes.DATE,
            allowNull: true
        },
        scopes: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('scopes');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                this.setDataValue('scopes',
                    Array.isArray(value) ? JSON.stringify(value) : value);
            }
        },
        plan: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'free'
        },
        lastAccessedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        settings: {
            type: DataTypes.JSONB,
            defaultValue: {},
            get() {
                const rawValue = this.getDataValue('settings');
                return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
            },
            set(value) {
                this.setDataValue('settings',
                    typeof value === 'string' ? value : JSON.stringify(value));
            }
        }
    }, {
        tableName: 'stores',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['shopDomain']
            },
            {
                // New index for accessToken
                fields: ['accessToken']
            }
        ],
        hooks: {
            beforeSave: async (store) => {
                if (store.shopDomain) {
                    store.shopDomain = store.shopDomain.toLowerCase();
                }
            }
        }
    });
};

export default Store;