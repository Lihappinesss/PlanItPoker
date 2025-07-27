import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import Room from './room';

class Task extends Model {
  public id!: number;
  public link!: string;
  public status!: string;
  public roomId!: number;
  public storyPoint!: number;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    },
    storyPoint: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Task',
  }
);

Task.belongsTo(Room);
Room.hasMany(Task, { onDelete: 'CASCADE' });

export default Task;