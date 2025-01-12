import devotionApiRoute from "./devotion.js";
import tenantApiRoute from "./tenant.js";

export default (app, db) => {
  tenantApiRoute(app, db);
  devotionApiRoute(app, db);
};
