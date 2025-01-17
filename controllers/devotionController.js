import db from "../controllers/databaseController.js";

export async function updateDevotionStreak(userId, tenantId) {
  const today = new Date().toISOString().split("T")[0];

  try {
    // Validate input parameters
    if (!userId || !tenantId) {
      return {
        success: false,
        message: "Invalid input parameters: userId and tenantId are required.",
      };
    }

    // Fetch user streak information
    const user = await db.query(
      "SELECT lastDevotionDate, currentStreak, maxStreak FROM devotionStreaks WHERE userId = ? AND tenantId = ?",
      [userId, tenantId]
    );

    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split("T")[0];

    if (user.length > 0) {
      const { lastDevotionDate, currentStreak, maxStreak } = user[0];

      if (lastDevotionDate === today) {
        // Devotion already logged today
        return { success: true, message: "Devotion already logged today." };
      } else if (lastDevotionDate === yesterday) {
        // Continue streak
        const newStreak = currentStreak + 1;
        await db.query(
          "UPDATE devotionStreaks SET lastDevotionDate = ?, currentStreak = ?, maxStreak = ? WHERE userId = ? AND tenantId = ?",
          [today, newStreak, Math.max(newStreak, maxStreak), userId, tenantId]
        );
        return {
          success: true,
          message: `Devotion streak continued! Current streak: ${newStreak}`,
        };
      } else {
        // Streak broken or new streak
        await db.query(
          "UPDATE devotionStreaks SET lastDevotionDate = ?, currentStreak = 1 WHERE userId = ? AND tenantId = ?",
          [today, userId, tenantId]
        );
        return {
          success: false,
          message: "Devotion streak broken! Starting a new streak.",
        };
      }
    } else {
      // First devotion entry
      await db.query(
        "INSERT INTO devotionStreaks (userId, tenantId, lastDevotionDate, currentStreak) VALUES (?, ?, ?, 1)",
        [userId, tenantId, today]
      );
      return {
        success: true,
        message: "First devotion logged! Start your streak.",
      };
    }
  } catch (error) {
    console.error("Error updating devotion streak:", error);
    return {
      success: false,
      message: "An error occurred while updating the devotion streak.",
      error: error.message,
    };
  }
}
