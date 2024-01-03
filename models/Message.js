const { DataTypes } = require('sequelize');
 
const Message = (sequelize) => {
  const MessageModel = sequelize.define('Message', {
    Pseudo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  });
  return MessageModel;
};
 
module.exports = Message;