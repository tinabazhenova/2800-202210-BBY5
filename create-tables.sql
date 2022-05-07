-- in database syntax, two dashes mean a one-line comment (i.e., not
-- interpreted by the database)


CREATE TABLE BBY-5-user (
  ID int NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(50),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password VARCHAR(50),
  is_admin TINYINT(1),
  PRIMARY KEY (ID)
);

