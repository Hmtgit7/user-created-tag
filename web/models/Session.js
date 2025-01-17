// // models/Session.js
// import { DataTypes } from 'sequelize';

// const Session = (sequelize) => {
//     return sequelize.define('Session', {
//         id: {
//             type: DataTypes.STRING,
//             primaryKey: true
//         },
//         shop: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         state: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         scope: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         accessToken: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         isOnline: {
//             type: DataTypes.BOOLEAN,
//             defaultValue: false
//         },
//         expires: {
//             type: DataTypes.DATE,
//             allowNull: true
//         }
//     }, {
//         tableName: 'sessions',
//         timestamps: true
//     });
// };

// export default Session;

// models/Session.js
import { DataTypes } from 'sequelize';

const SessionModel = (sequelize) => {
    return sequelize.define('Session', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        shop: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isOnline: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        scope: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        accessToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        expires: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'sessions',
        timestamps: true
    });
};

export default SessionModel;