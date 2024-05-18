DROP TABLE IF EXISTS Sessions;
CREATE TABLE IF NOT EXISTS Sessions (
  id VARCHAR(255) PRIMARY KEY,
  shop VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  isOnline BOOLEAN DEFAULT FALSE,
  scope VARCHAR(255),
  expires DATETIME,
  accessToken VARCHAR(255) NOT NULL,
  userId BIGINT,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  email VARCHAR(255),
  accountOwner BOOLEAN DEFAULT FALSE,
  locale VARCHAR(255),
  collaborator BOOLEAN DEFAULT FALSE,
  emailVerified BOOLEAN DEFAULT FALSE
);