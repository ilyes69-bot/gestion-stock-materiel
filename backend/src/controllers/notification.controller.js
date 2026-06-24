const {
  getNotificationsByUser,
  markNotificationAsRead,
} = require("../services/notification.service");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsByUser(req.user.id);

    res.status(200).json({
      message: "Liste de mes notifications",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const readNotification = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      message: "Notification marquée comme lue",
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  readNotification,
};