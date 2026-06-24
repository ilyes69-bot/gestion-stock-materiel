const supabase = require("../config/supabase");

const createNotification = async ({ userId, contenu, type }) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: userId,
        contenu,
        type,
        lu: false,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getNotificationsByUser = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const markNotificationAsRead = async (notificationId, userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ lu: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead,
};