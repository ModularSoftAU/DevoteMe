CREATE DATABASE devoteMe;

CREATE TABLE tenants (
    tenantId BIGINT PRIMARY KEY,
    tenantName VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenantConfiguration (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenantId INT NOT NULL,
  devotion_channel BIGINT,
  votd_channel BIGINT,
  FOREIGN KEY (tenantId) REFERENCES tenants(tenantId) ON DELETE CASCADE
);

CREATE TABLE prayers (
    prayerId INT PRIMARY KEY AUTO_INCREMENT,
    tenantId BIGINT NOT NULL,
    messageId VARCHAR(255) NOT NULL,
    userId BIGINT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(tenantId)
);

CREATE TABLE devotions (
    devotionId INT PRIMARY KEY AUTO_INCREMENT,
    tenantId BIGINT NOT NULL,
    messageId VARCHAR(255) UNIQUE NOT NULL,
    userId BIGINT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(tenantId)
);

CREATE TABLE votd (
    votdId INT PRIMARY KEY AUTO_INCREMENT,
    tenantId BIGINT NOT NULL,
    messageId VARCHAR(255) UNIQUE NOT NULL,
    userId BIGINT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES tenants(tenantId)
);