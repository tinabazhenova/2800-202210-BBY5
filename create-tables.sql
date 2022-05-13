-- in database syntax, two dashes mean a one-line comment (i.e., not
-- interpreted by the database)


CREATE TABLE BBY_5_user (
  ID int NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(50),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password VARCHAR(50),
  is_admin TINYINT(1),
  user_image VARCHAR(100) DEFAULT NULL,
  bbscore int,
  xscore int,
  yscore int,
  zscore int,
  PRIMARY KEY (ID)
);

CREATE TABLE BBY_05_master (
  word_ID int NOT NULL AUTO_INCREMENT,
  phrase VARCHAR(50) NOT NULL,
  meaning VARCHAR(200),
  history VARCHAR(500),
  bbvalue int,
  xvalue int,
  yvalue int,
  zvalue int,
  PRIMARY KEY (word_ID)
);

