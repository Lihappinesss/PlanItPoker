import crypto from 'crypto';
import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

import { Migration } from './types';

type RoomRow = {
  id: number;
  ownerId: number | null;
  inviteCode: string | null;
};

type UserRow = {
  id: number;
};

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

const generateInviteCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

const createUniqueInviteCode = async (sequelize: Sequelize) => {
  let inviteCode = generateInviteCode();

  for (;;) {
    const [existingRooms] = await sequelize.query(
      'SELECT id FROM "Rooms" WHERE "inviteCode" = :inviteCode LIMIT 1',
      {
        replacements: { inviteCode },
      }
    );

    if ((existingRooms as Array<{ id: number }>).length === 0) {
      return inviteCode;
    }

    inviteCode = generateInviteCode();
  }
};

const migration: Migration = {
  name: '202605180001-room-access',
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    if (!(await columnExists(queryInterface, 'Rooms', 'ownerId'))) {
      await queryInterface.addColumn('Rooms', 'ownerId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    if (!(await columnExists(queryInterface, 'Rooms', 'inviteCode'))) {
      await queryInterface.addColumn('Rooms', 'inviteCode', {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }

    if (!(await tableExists(queryInterface, 'room_members'))) {
      await queryInterface.createTable('room_members', {
        roomId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Rooms',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      });
    }

    const [rooms] = await sequelize.query('SELECT id, "ownerId", "inviteCode" FROM "Rooms"');
    const [users] = await sequelize.query('SELECT id FROM "users" ORDER BY id ASC LIMIT 1');

    const fallbackOwner = (users as UserRow[])[0];

    for (const room of rooms as RoomRow[]) {
      let ownerId = room.ownerId;

      if (!ownerId && fallbackOwner) {
        ownerId = fallbackOwner.id;

        await queryInterface.bulkUpdate(
          'Rooms',
          { ownerId },
          { id: room.id }
        );
      }

      if (!room.inviteCode) {
        const inviteCode = await createUniqueInviteCode(sequelize);

        await queryInterface.bulkUpdate(
          'Rooms',
          { inviteCode },
          { id: room.id }
        );
      }

      if (ownerId) {
        await sequelize.query(
          `INSERT INTO room_members ("roomId", "userId")
           VALUES (:roomId, :userId)
           ON CONFLICT ("roomId", "userId") DO NOTHING`,
          {
            replacements: {
              roomId: room.id,
              userId: ownerId,
            },
          }
        );
      }
    }

    await queryInterface.changeColumn('Rooms', 'ownerId', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.changeColumn('Rooms', 'inviteCode', {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    });
  },
};

export default migration;
