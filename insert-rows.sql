
INSERT INTO BBY_5_user (ID, user_name, first_name, last_name, password, is_admin) VALUES (1, 'jparry', 'jim', 'parry', 'java', 0);
INSERT INTO BBY_5_user (ID, user_name, first_name, last_name, password, is_admin) VALUES (2, 'a-aron', 'arron', 'ferguson', 'a123', 0);
INSERT INTO BBY_5_user (ID, user_name, first_name, last_name, password, is_admin) VALUES (3, 'donna', 'donna', 'turner', 'a123', 0);
INSERT INTO BBY_5_user (ID, user_name, first_name, last_name, password, is_admin) VALUES (4, 'jason', 'jason', 'wilder', 'a123', 0);
INSERT INTO BBY_5_user (ID, user_name, first_name, last_name, password, is_admin) VALUES (5, 'keith', 'keith', 'tang', 'a123', 0);
INSERT INTO BBY_5_user (ID, user_name, first_name, last_name, password, is_admin) VALUES (6, 'arnold', 'arnold', 'schwarzenegger ', 'illbeback', 0);
INSERT INTO BBY_5_user (ID, user_name, first_name, last_name, password, is_admin) VALUES (7, 'sarvmr', 'Naz', 'Mohammadi', 'admin1', 1);
INSERT INTO BBY_5_user (user_name, first_name, last_name, password, is_admin) VALUES ('john', 'doe', 'adult', 'sk8terboi', 0);

INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ('Go postal', 'To suddenly behave in a very violent or angry way', 'The expression derives from a series of incidents from 1986 onward with USPS', 200, 'X');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ('Salty', 'Angry, irritated or hostile', 'U.S. slang sense of ""angry, irritated"" is first attested 1938 (probably from similar use with regard to sailors, ""tough, aggressive,"" attested by 1920)', 200, 'Y');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ('No Cap', 'Meant to convey authenticity and truth.', 'In the 1940s, according to Green''s Dictionary of Slang, to cap is evidenced as slang meaning ""to surpass,"" connected to the ritualized insults of capping (1960s)', 200, 'Z');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ('thong', 'A light sandal with a thong between the big and second toe.', '""Thong"" comes from words meaning ""restraint,"" according to The Oxford English Dictionary, and was originally a narrow strip of leather used to secure something.', 200, 'B');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ('Gas of a time', 'A popular slang term in the 1960s, a `gas` was any activity or event that was either fun or inspired you to laugh', ' The first is the expression `everything is gas and goiters,` which is first found in print used by Charles Dickens in 1839, meaning quite satisfactory', 200, 'B');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ('Don``t flip your wig', "Use it to tell someone to calm down. ", 'Contrary to popular belief, it is not an old phrase, but was born in North America. The Oxford English Dictionary has the first print appearance listed in 1952.', 200, 'B');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ("Simp", "Short for simpleton and of showing excessive sympathy and attention toward another", "The 'New Partridge Dictionary of Slang and Unconventional English,' defines it as a shortened version of simpleton, so the phrase''s original meaning is rooted in calling someone stupid. The dictionary lists its first known usage as 1946, though it appeared in The New York Times as early as 1923", 200, 'Z');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ("Word", "You're right", "The phrase 'word' originally came from saying that your word is your bond, and it was shortened to just 'word.'", 200, 'X');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ("Wigging out", "Going crazy", "'Wigging out' is a variation of the older slang 'flip your wig' which was coined in 1952 or earlier", 200, 'X');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ("NOT", "psych!", "Popularized in North America in the 1990s by the Saturday Night Live sketch and subsequent film Wayne''s World, 'not' was selected as the 1992 Word of the Year by the American Dialect Society.", 200, 'Y');
INSERT INTO BBY_5_master (phrase, meaning, history, value, generation) VALUES ("Gettin' Jiggy", "Dance like no one is watching", "This 90s phrase came from the popular music video by Will Smith, Gettin' Jiggy With It.", 200, 'Y');

INSERT INTO BBY_5_crossword(crossword_id, word_id, row_num, col, vertical) VALUES(1, 2, 3, 0, 0);
INSERT INTO BBY_5_crossword(crossword_id, word_id, row_num, col, vertical) VALUES(1, 3, 0, 1, 1);
INSERT INTO BBY_5_crossword(crossword_id, word_id, row_num, col, vertical) VALUES(1, 4, 3, 3, 1);
INSERT INTO BBY_5_crossword(crossword_id, word_id, row_num, col, vertical) VALUES(1, 6, 6, 1, 0);

INSERT INTO BBY_5_item (ID, name, description, price, type) VALUES (NULL, 'BB upgrade coupon', 'Upgrades your BB title by 1 level.', 2000, 'B');
INSERT INTO BBY_5_item (ID, name, description, price, type) VALUES (NULL, 'X upgrade coupon', 'Upgrades your X title by 1 level.', 2000, 'X');
INSERT INTO BBY_5_item (ID, name, description, price, type) VALUES (NULL, 'Y upgrade coupon', 'Upgrades your Y title by 1 level.', 2000, 'Y');
INSERT INTO BBY_5_item (ID, name, description, price, type) VALUES (NULL, 'Z upgrade coupon', 'Upgrades your Z title by 1 level.', 2000, 'Z');
