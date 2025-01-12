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

  // Edit tenant endpoint
  app.post(baseEndpoint + "/update", async function (req, res) {
    const tenantId = required(req.body, "tenantId", res);
    const tenantName = required(req.body, "tenantName", res);

    try {
      await db.query(
        `
          UPDATE tenants 
          SET 
            tenantName=?
          WHERE tenantId=?;
        `,
        [
          tenantName,
          tenantId
        ]
      );

      return res.send({
        success: true,
        message: `Tenant updated`,
      });
    } catch (error) {
      res.send({
        success: false,
        message: `${error}`,
      });
    }
  });
}