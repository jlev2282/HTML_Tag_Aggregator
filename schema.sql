DROP DATABASE IF EXISTS scoring_project;
CREATE DATABASE scoring_project;

USE scoring_project;

CREATE TABLE files(
    file_id INT AUTO_INCREMENT NOT NULL,
    `file_directory` VARCHAR(45) NOT NULL,
    file_name VARCHAR(45) NOT NULL,
    `div` INT(10) NOT NULL,
    p INT(10) NOT NULL,
    h1 INT(10) NOT NULL,
    h2 INT(10) NOT NULL,
    html INT(10) NOT NULL,
    body INT(10) NOT NULL,
    header INT(10) NOT NULL,
    footer INT(10) NOT NULL,
    font INT(10) NOT NULL,
    center INT(10) NOT NULL,
    big INT(10) NOT NULL, 
    strike INT(10) NOT NULL,
    tt INT(10) NOT NULL,
    frameset INT(10) NOT NULL,
    frame INT(10) NOT NULL,
    lowest VARCHAR(10),
    highest VARCHAR(10),
    average VARCHAR(10),
    ran_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    primary key(file_id)
);

