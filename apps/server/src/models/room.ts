import { DataTypes, Model, Optional } from 'sequelize';
import {sequelize} from '../db';


interface RoomAttributes {
  id: number;
  title: string;
  ownerId: number;
  inviteCode: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RoomCreationAttributes extends Optional<RoomAttributes, 'id'> {}

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: number;
  public title!: string;
  public ownerId!: number;
  public inviteCode!: string;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Room',
  }
);

export default Room;
