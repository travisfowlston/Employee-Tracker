INSERT INTO department (name)
VALUES  ('Sales'),
        ('Marketing'),
        ('Finance');

INSERT INTO role (title, salary, department_id) 
VALUES  ('Sales Manager', 60000, 1),
        ('Marketing Coordinator', 40000, 2),
        ('Financial Analyst', 50000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES  ('John', 'Doe', 1, NULL),
        ('Jane', 'Smith', 2, 1),
        ('Mike', 'Johnson', 3, 1);