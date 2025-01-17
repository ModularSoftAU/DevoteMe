import db from "../controllers/databaseController.js";

export async function updateVOTDStreak(userId, tenantId) {
  const today = new Date().toISOString().split("T")[0];

  const user = await db.query(
    "SELECT lastVOTDDate, currentStreak, maxStreak FROM votdStreaks WHERE userId = ? AND tenantId = ?",
    [userId, tenantId]
  );

  if (user.length > 0) {
    const { lastVOTDDate, currentStreak, maxStreak } = user[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split("T")[0];

    if (lastVOTDDate === yesterday) {
      const newStreak = currentStreak + 1;
      await db.query(
        "UPDATE votdStreaks SET lastVOTDDate = ?, currentStreak = ?, maxStreak = ? WHERE userId = ? AND tenantId = ?",
        [today, newStreak, Math.max(newStreak, maxStreak), userId, tenantId]
      );
      return {
        success: true,
        message: `VOTD streak continued! Current streak: ${newStreak}`,
      };
    } else if (lastVOTDDate < yesterday) {
      await db.query(
        "UPDATE votdStreaks SET lastVOTDDate = ?, currentStreak = 1 WHERE userId = ? AND tenantId = ?",
        [today, userId, tenantId]
      );
      return {
        success: false,
        message: "VOTD streak broken! Starting a new streak.",
      };
    } else {
      return { success: true, message: "VOTD already logged today." };
    }
  } else {
    await db.query(
      "INSERT INTO votdStreaks (userId, tenantId, lastVOTDDate, currentStreak) VALUES (?, ?, ?, 1)",
      [userId, tenantId, today]
    );
    return { success: true, message: "First VOTD logged! Start your streak." };
  }
}
