DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department(
    id INT AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY(id)
);

CREATE TABLE role(
    id INT AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    PRIMARY KEY(id)
);

CREATE TABLE employee(
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    PRIMARY KEY(id)
);

-- dev team 1, finance 2, design 3, legal 4 --
INSERT INTO role (title, salary, department_id)
VALUES ('Accountant', 75000, 2), ('Sales Lead', 85000, 2), ('Intern', 0, 3), ('Junior Developer', 65000, 1), ('Senior Developer', 120000, 1), ('Graphic Designer', 80000, 3), ('Lawyer', 300000, 4);