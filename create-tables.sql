CREATE TABLE BBY_5_user (
  ID int NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(50),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password VARCHAR(50),
  is_admin TINYINT(1),
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

CREATE TABLE BBY_5_item (
  ID int NOT NULL AUTO_INCREMENT,
  name VARCHAR(50),
  description VARCHAR(50),
  price int,
  PRIMARY KEY (ID)
);

CREATE TABLE BBY_5_cart_item (
  user_ID INT,
  item_ID INT,
  quantity INT,
  PRIMARY KEY (user_ID, item_ID)
);

CREATE TABLE BBY_5_has_item (
  user_ID INT,
  item_ID INT,
  quantity INT,
  PRIMARY KEY (user_ID, item_ID)
);

ALTER TABLE BBY_5_cart_item ADD FOREIGN KEY (user_ID) REFERENCES BBY_5_user (ID);
ALTER TABLE BBY_5_cart_item ADD FOREIGN KEY (item_ID) REFERENCES BBY_5_item (ID);
