

-- COUNTRIES
INSERT INTO countries (country_id, name, logo) VALUES
(1,'Mexico','mexico.png'),
(2,'USA','usa.png'),
(3,'Canada','canada.png'),
(4,'Spain','spain.png'),
(5,'Japan','japan.png');

-- TYPE USERS
INSERT INTO type_users (type_id, relation) VALUES
(1,'player'),
(2,'developer'),
(3,'tester'),
(4,'admin');

-- ROLES
INSERT INTO roles (role_id, description) VALUES
(1,'player'),
(2,'moderator'),
(3,'admin');

-- COMPANIES

INSERT INTO companies (company_id, name)
VALUES
(1,'Google'),
(2,'John Deere'),
(3,'Microsoft');

-- USERS (10 users)
INSERT INTO users
(user_id,name,country,email,password_hash,phone,type_of_user,company_id,birthday,is_active,is_banned)
VALUES
(1,'Francisco Lopez',1,'francisco@email.com','hash1','8110000001',1,1,'1998-04-10',TRUE,FALSE),
(2,'Jorge Ramirez',1,'jorge@email.com','hash2','8110000002',1,2,'1997-02-20',TRUE,FALSE),
(3,'Ian Torres',2,'ian@email.com','hash3','8110000003',1,3,'2000-09-15',TRUE,FALSE),
(4,'Daniel Perez',3,'daniel@email.com','hash4','8110000004',2,3,'1996-12-01',TRUE,FALSE),
(5,'Maria Gonzalez',4,'maria@email.com','hash5','8110000005',1,NULL,'1999-07-11',TRUE,FALSE),
(6,'Luis Hernandez',1,'luis@email.com','hash6','8110000006',3,1,'1995-01-25',TRUE,FALSE),
(7,'Ana Martinez',5,'ana@email.com','hash7','8110000007',1,NULL,'2001-03-30',TRUE,FALSE),
(8,'Carlos Sanchez',2,'carlos@email.com','hash8','8110000008',2,2,'1994-08-18',TRUE,FALSE),
(9,'Sofia Diaz',3,'sofia@email.com','hash9','8110000009',1,NULL,'2002-11-09',TRUE,FALSE),
(10,'Miguel Castillo',4,'miguel@email.com','hash10','8110000010',4,1,'1993-05-05',TRUE,FALSE);

-- USER ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
(1,1),
(2,1),
(3,1),
(4,2),
(5,1),
(6,2),
(7,1),
(8,2),
(9,1),
(10,3);

-- GAMES
INSERT INTO games (game_id,name) VALUES
(1,'Memory Challenge'),
(2,'Speed Math'),
(3,'Word Puzzle');

-- MATCHES
INSERT INTO matches
(user_id,game_id,time_start,date_end,score,aciertos,power_ups,racha)
VALUES
(1,1,'2026-03-10 10:00:00+00','2026-03-10 10:05:00+00',120,10,2,4),
(2,2,'2026-03-10 11:00:00+00','2026-03-10 11:07:00+00',200,15,1,6),
(3,1,'2026-03-10 12:00:00+00','2026-03-10 12:03:00+00',90,8,0,3),
(4,3,'2026-03-10 13:00:00+00','2026-03-10 13:10:00+00',300,20,3,8),
(5,2,'2026-03-10 14:00:00+00','2026-03-10 14:04:00+00',150,12,1,5),
(6,1,'2026-03-10 15:00:00+00','2026-03-10 15:06:00+00',110,9,2,4),
(7,3,'2026-03-10 16:00:00+00','2026-03-10 16:09:00+00',260,18,2,7),
(8,2,'2026-03-10 17:00:00+00','2026-03-10 17:05:00+00',175,13,1,5),
(9,1,'2026-03-10 18:00:00+00','2026-03-10 18:04:00+00',95,7,0,3),
(10,3,'2026-03-10 19:00:00+00','2026-03-10 19:12:00+00',320,22,4,9);
