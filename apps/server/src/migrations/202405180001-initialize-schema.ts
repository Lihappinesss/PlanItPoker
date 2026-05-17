import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

import { Migration } from './types';

const tableExists = async (queryInterface: QueryInterface, tableName: string) => {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch (error) {
    return false;
  }
};

const columnExists = async (
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string
) => {
  const definition = await queryInterface.describeTable(tableName);
  return Boolean(definition[columnName]);
};

const migration: Migration = {
  name: '202405180001-initialize-schema',
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    if (!(await tableExists(queryInterface, 'users'))) {
      await queryInterface.createTable('users', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'voting',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    } else if (!(await columnExists(queryInterface, 'users', 'role'))) {
      await queryInterface.addColumn('users', 'role', {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'voting',
      });
    } else {
      await queryInterface.changeColumn('users', 'role', {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'voting',
      });
    }

    if (!(await tableExists(queryInterface, 'Rooms'))) {
      await queryInterface.createTable('Rooms', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    if (!(await tableExists(queryInterface, 'Tasks'))) {
      await queryInterface.createTable('Tasks', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        link: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'pending',
        },
        roomId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Rooms',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        storyPoint: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }
  },
};

export default migration;
