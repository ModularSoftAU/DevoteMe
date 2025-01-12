import { required, optional } from "../common.js";

export default function tenantApiRoute(app, db) {
  const baseEndpoint = "/api/tenant";

  // Function to fetch tenants
  async function getTenants(dbQuery) {
    const [results, fields] = await db.query(dbQuery);
    return results;
  }

  // Get tenant(s) endpoint
  app.get(baseEndpoint + "/get", async function (req, res) {
    const tenantId = optional(req.query, "id");

    try {
      // Get Tenant by specific ID
      if (tenantId) {
        let dbQuery = `SELECT * FROM tenants WHERE tenantId=${tenantId};`;
        const results = await getTenants(dbQuery);
        if (!results.length) {
          return res.send({
            success: false,
            message: `There are no tenants`,
          });
        }

        res.send({
          success: true,
          data: results,
        });
        return;
      }

      // Show all Tenants
      let dbQuery = `SELECT * FROM tenants;`;
      const results = await getTenants(dbQuery);
      if (!results.length) {
        return res.send({
          success: false,
          message: `There are no tenants`,
        });
      }

      res.send({
        success: true,
        data: results,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `${error}`,
      });
    }
  });

  // Create tenant endpoint
  app.post(baseEndpoint + "/create", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const tenantName = required(req.body, "tenantName", res);

    try {
      await db.query(
        `INSERT INTO tenants (tenantId, tenantName) VALUES (?, ?)`,
        [tenantId, tenantName]
      );

      res.send({
        success: true,
        content: `New Tenant Created: ${tenantName}`,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `${error}`,
      });
    }
  });

  // Update tenant endpoint
  app.post(baseEndpoint + "/update", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const votdChannel = optional(req.body, "votd_channel", res);
    const devotionChannel = optional(req.body, "devotion_channel", res);

    try {
      // Check if the tenant's configuration already exists
      const existingConfig = await db.query(
        `SELECT id FROM tenantConfiguration WHERE tenantId = ?`,
        [tenantId]
      );

      let updateFields = [];
      let updateValues = [];

      if (votdChannel) {
        updateFields.push("votd_channel = ?");
        updateValues.push(votdChannel);
      }

      if (devotionChannel) {
        updateFields.push("devotion_channel = ?");
        updateValues.push(devotionChannel);
      }

      // Check if there are fields to update
      if (updateFields.length > 0) {
        updateValues.push(tenantId); // Add tenantId for the WHERE clause

        // If configuration exists, update the fields
        if (existingConfig.length > 0) {
          await db.query(
            `
          UPDATE tenantConfiguration
          SET ${updateFields.join(", ")}
          WHERE tenantId = ?;
        `,
            updateValues
          );
        } else {
          // If configuration doesn't exist, insert new values
          await db.query(
            `
          INSERT INTO tenantConfiguration (tenantId, ${updateFields.join(", ")})
          VALUES (?, ?);
        `,
            [tenantId, ...updateValues]
          );
        }

        return res.send({
          success: true,
          message: `Tenant configuration updated`,
        });
      } else {
        return res.send({
          success: false,
          message: "No valid fields provided to update.",
        });
      }
    } catch (error) {
      res.send({
        success: false,
        message: `Error: ${error.message}`,
      });
    }
  });
}