/* eslint-disable no-unused-vars */
"use strict";
const { Model, where } = require("sequelize");
const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, { foreignKey: "userId" });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    setCompletionStatus(completedStatus) {
      return this.update({
        completed: completedStatus,
      });
    }

    static getTodos(userId) {
      const todos = Todo.findAll({
        where: {
          userId,
        },
      });
      return todos;
    }

    static async getOverdueItems(userId) {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }

    static async getDueTodayItems(userId) {
      const dueTodayItems = await Todo.findAll({
        where: {
          dueDate: new Date(),
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
      return dueTodayItems;
    }

    static async getDueLaterItems(userId) {
      const dueLaterItems = await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
      return dueLaterItems;
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }

    static async getCompletedTodos(userId) {
      return await this.findAll({
        where: {
          completed: true,
          userId,
        },
        order: [["id", "DESC"]],
      });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
