import { DataTypes, Model } from 'sequelize';

import { sequelize } from '../db';
import Room from './room';
import User from './user';

class RoomMember extends Model {
  public roomId!: number;
  public userId!: number;
}

RoomMember.init(
  {
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
  },
  {
    sequelize,
    tableName: 'room_members',
    timestamps: false,
  }
);

Room.belongsToMany(User, {
  through: RoomMember,
  foreignKey: 'roomId',
  otherKey: 'userId',
  as: 'members',
});

User.belongsToMany(Room, {
  through: RoomMember,
  foreignKey: 'userId',
  otherKey: 'roomId',
  as: 'rooms',
});

Room.hasMany(RoomMember, {
  foreignKey: 'roomId',
  as: 'roomMembers',
  onDelete: 'CASCADE',
});

RoomMember.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

User.hasMany(RoomMember, {
  foreignKey: 'userId',
  as: 'roomMemberships',
  onDelete: 'CASCADE',
});

RoomMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export default RoomMember;
