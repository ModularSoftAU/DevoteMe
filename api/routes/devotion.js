import { required, optional } from "../common.js";

export default function devotionApiRoute(app, db) {
  const baseEndpoint = "/api/devotion";

  // Create devotion endpoint
  app.post(baseEndpoint + "/add", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const messageId = required(req.body, "messageId", res);
    const userId = required(req.body, "userId", res);

    try {
      await db.query(
        `INSERT INTO devotions (tenantId, messageId, userId) VALUES (?, ?, ?)`,
        [tenantId, messageId, userId]
      );

      res.send({
        success: true,
        content: `Devotion entry created for tenant ${tenantId} with message ID ${messageId}`,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `Error creating devotion entry: ${error}`,
      });
    }
  });
}