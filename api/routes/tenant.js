import { required, optional } from "../common.js";

export default function tenantApiRoute(app, db) {
  const baseEndpoint = "/api/tenant";

  app.get(baseEndpoint + "/get", async function (req, res) {
    const tenantId = optional(req.query, "id");

    try {
      function getTenants(dbQuery) {
        return new Promise((resolve, reject) => {
          db.query(dbQuery, function (error, results, fields) {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      }

      // Get Tenant by specific ID.
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

  app.post(baseEndpoint + "/create", async function (req, res) {
    isFeatureEnabled(features.announcements, res, lang);

    const actioningUser = required(req.body, "actioningUser", res);
    const enabled = required(req.body, "enabled", res);
    const announcementType = required(req.body, "announcementType", res);
    const body = optional(req.body, "body", res);
    const colourMessageFormat = optional(req.body, "colourMessageFormat", res);
    const link = optional(req.body, "link", res);

    try {
      db.query(
        `INSERT INTO announcements (enabled, body, announcementType, link, colourMessageFormat) VALUES (?, ?, ?, ?, ?)`,
        [
          enabled,
          body,
          announcementType,
          link,
          colourMessageFormat,
          Date.now(),
        ],
        function (error, results, fields) {
          if (error) {
            return res.send({
              success: false,
              message: `${error}`,
            });
          }

          res.send({
            success: true,
            alertType: "success",
            content: lang.announcement.announcementCreated,
          });
        }
      );
    } catch (error) {
      res.send({
        success: false,
        message: `${error}`,
      });
    }
  });

  app.post(baseEndpoint + "/edit", async function (req, res) {
    isFeatureEnabled(features.announcements, res, lang);

    const actioningUser = required(req.body, "actioningUser", res);
    const announcementId = required(req.body, "announcementId", res);
    const enabled = required(req.body, "enabled", res);
    const announcementType = required(req.body, "announcementType", res);
    const body = optional(req.body, "body", res);
    const colourMessageFormat = optional(req.body, "colourMessageFormat", res);
    const link = optional(req.body, "link", res);

    try {
      db.query(
        `
          UPDATE announcements 
          SET 
            enabled=?,
            announcementType=?,
            body=?,
            colourMessageFormat=?,
            link=? 
          WHERE announcementId=?;`,
        [
          enabled,
          announcementType,
          body,
          colourMessageFormat,
          link,
          announcementId,
        ],
        function (error, results, fields) {
          if (error) {
            return res.send({
              success: false,
              message: `${error}`,
            });
          }

          return res.send({
            success: true,
            message: `lang.announcement.announcementEdited`,
          });
        }
      );
    } catch (error) {
      res.send({
        success: false,
        message: `${error}`,
      });
    }
  });
}