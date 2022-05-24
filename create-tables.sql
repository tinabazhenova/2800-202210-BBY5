CREATE TABLE BBY_5_user (
  ID int NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(50),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password VARCHAR(50),
  is_admin TINYINT(1),
  bbscore int DEFAULT 0,
  xscore int DEFAULT 0,
  yscore int DEFAULT 0,
  zscore int DEFAULT 0,
  bblevel int DEFAULT 1,
  xlevel int DEFAULT 1,
  ylevel int DEFAULT 1,
  zlevel int DEFAULT 1,
  title VARCHAR(20) DEFAULT "None",
  user_image VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE BBY_5_master (
  word_ID int NOT NULL AUTO_INCREMENT,
  phrase VARCHAR(50) NOT NULL,
  meaning VARCHAR(200),
  history VARCHAR(500),
  value int,
  generation VARCHAR(1),
  PRIMARY KEY (word_ID)
);

CREATE TABLE BBY_5_crossword (
  crossword_id int not null,
  word_id int not null,
  row_num int not null,
  col int not null,
  vertical tinyint not null,
  primary key (crossword_id, word_id)
);

CREATE TABLE BBY_5_item (
  ID int NOT NULL AUTO_INCREMENT,
  name VARCHAR(50),
  description VARCHAR(50),
  price int,
  type VARCHAR(1),
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

CREATE TABLE BBY_5_chat (
  ID int NOT NULL AUTO_INCREMENT,
  username VARCHAR(50),
  title VARCHAR(20),
  content VARCHAR(500),
  room INT,
  PRIMARY KEY (ID)
);

ALTER TABLE BBY_5_cart_item ADD FOREIGN KEY (user_ID) REFERENCES BBY_5_user (ID);
ALTER TABLE BBY_5_cart_item ADD FOREIGN KEY (item_ID) REFERENCES BBY_5_item (ID);