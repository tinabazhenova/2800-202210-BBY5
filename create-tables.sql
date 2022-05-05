-- in database syntax, two dashes mean a one-line comment (i.e., not
-- interpreted by the database)


CREATE TABLE user (
  ID int NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(50),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password VARCHAR(50),
  xscore int,
  yscore int,
  zscore int,
  bbscore int,
  PRIMARY KEY (ID)
);

CREATE TABLE master (
  word_ID int NOT NULL AUTO_INCREMENT,
  phrase VARCHAR(50) NOT NULL,
  meaning VARCHAR(200),
  history VARCHAR(500),
  xvalue int,
  yvalue int,
  zvalue int,
  bbvalue int,
  PRIMARY KEY (word_ID)
);
