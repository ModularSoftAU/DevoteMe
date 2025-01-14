import { updateDevotionStreak } from "../../controllers/devotionController.js";
import { required, optional } from "../common.js";

export default function devotionApiRoute(app, db) {
  const baseEndpoint = "/api/devotion";

  app.get(baseEndpoint + "/check", async function (req, res) {
    const tenantId = required(req.query, "tenantId", res);
    const messageId = required(req.query, "messageId", res);
    const userId = required(req.query, "userId", res);

    try {
      // Perform a SELECT query to check if the record exists
      const [rows] = await db.query(
        `SELECT 1 FROM devotions WHERE tenantId = ? AND messageId = ? AND userId = ? LIMIT 1`,
        [tenantId, messageId, userId]
      );

      // If any row is returned, that means the record exists
      const exists = rows.length > 0;

      // Return a boolean indicating if the record exists
      res.send({
        success: true,
        exists: exists,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `Error checking Devotion entry: ${error}`,
      });
    }
  });

  // Create devotion endpoint
  app.post(baseEndpoint + "/add", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const messageId = required(req.body, "messageId", res);
    const userId = required(req.body, "userId", res);

    try {
      // Insert the devotion entry
      await db.query(
        `INSERT INTO devotions (tenantId, messageId, userId) VALUES (?, ?, ?)`,
        [tenantId, messageId, userId]
      );

      // Update the devotion streak
      const streakResult = await updateDevotionStreak(userId, tenantId);

      console.log(streakResult);
      

      res.send({
        success: true,
        content: `Devotion entry created for tenant ${tenantId} with message ID ${messageId}. ${streakResult.message}`,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `Error creating devotion entry: ${error}`,
      });
    }
  });
}