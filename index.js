/* All required packages */
const inquirer = require("inquirer");
const mysql = require("mysql2");
/* Requires the hidden .env file */
require("dotenv").config();
/* Formats the queries in a table */
require("console.table");

/* Connection to the database */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
console.log(`Connected to the ${process.env.DB_DATABASE} database.`);

/* Defines the startMenu function as an asynchronous function */
const startMenu = async () => {
  /* Uses a while loop that will continue running until the user chooses to exit the application */
  while (true) {
    /* Uses await to pause the execution and wait for the asynchronous inquirer.prompt function to complete before continuing */
    const { options } = await inquirer.prompt([
      {
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Exit",
        ],
      },
    ]);

    /* Uses a switch statement to determine which function to execute based on the user's selection */
    switch (options) {
      case "View all departments":
        await viewDepartments();
        break;
      case "View all roles":
        await viewRoles();
        break;
      case "View all employees":
        await viewEmployees();
        break;
      case "Add a department":
        await addDepartment();
        break;
      case "Add a role":
        await addRole();
        break;
      case "Add an employee":
        await addEmployee();
        break;
      case "Update an employee role":
        await updateEmployeeRole();
        break;
      case "Exit":
        console.log("Session terminated!");
        return;
    }
  }
};

/* Uses the db.promise().query() method to return everything in the departments table from the database */
const viewDepartments = async () => {
  const [allDepartments] = await db
    .promise()
    .query("SELECT * FROM department;");
  console.table(allDepartments);
};

/* Uses the db.promise().query() method to return everything in the role table from the database */
const viewRoles = async () => {
  const [allRoles] = await db.promise().query("SELECT * FROM role;");
  console.table(allRoles);
};

/* Uses the db.promise().query() method to return everything in the employee table from the database */
const viewEmployees = async () => {
  const [allEmployees] = await db.promise().query("SELECT * FROM employee;");
  console.table(allEmployees);
};

const addDepartment = async () => {
  /* Prompts the user to enter the name of the department they want to add */
  const { departmentName } = await inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "Enter the name of the department:",
    },
  ]);

  /* Uses the db.promise().query() method to insert the new department into the database */
  await db
    .promise()
    .query("INSERT INTO department (name) VALUES (?)", [departmentName]);

  /* Let's the user know the department was added successfully */
  console.log(`Department "${departmentName}" was added successfully!`);
};

const addRole = async () => {
  const [departments] = await db.promise().query("SELECT id FROM department;");
  /* Prompts the user to enter the title, salary, and department ID of the new role */
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter the title of the role:",
    },
    {
      type: "input",
      name: "salary",
      message: "Enter the salary of the role:",
    },
    {
      type: "list",
      name: "departmentId",
      message: "Select the department ID of the role:",
      choices: departments.map((department) => department.id),
    },
  ]);

  /* Retrieves the details of the role from the user's input */
  const { title, salary, departmentId } = answers;

  /* Uses the db.promise().query() method to insert the new role into the database */
  await db
    .promise()
    .query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [
      title,
      salary,
      departmentId,
    ]);

  console.log("The new role added successfully!");
};

const addEmployee = async () => {
  const [roles] = await db
    .promise()
    .query("SELECT id FROM role WHERE id IS NOT NULL;");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter the first name of the employee:",
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter the last name of the employee:",
    },
    {
      type: "list",
      name: "roleId",
      message: "Select the role ID of the employee:",
      choices: roles.map((role) => role.id),
    },
    {
      type: "input",
      name: "managerId",
      message: "Enter the manager ID of the employee (leave blank if none):",
    },
  ]);

  const { firstName, lastName, roleId, managerId } = answers;

  await db
    .promise()
    .query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
      [firstName, lastName, roleId, managerId]
    );

  console.log("A new employee was added successfully!");
};

const updateEmployeeRole = async () => {
  /* Returns all of the employees */
  const [employees] = await db.promise().query("SELECT * FROM employee;");

  /* Prompts the user to select the employee they want to update */
  const updateEmployee = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Select an employee to update:",
      choices: employees.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      })),
    },
  ]);

  /* Returns the all of the roles from the role table in the database */
  const [roles] = await db.promise().query("SELECT * FROM role;");

  /* Prompts the user to select a new role for the choosen employee */
  const updatedRole = await inquirer.prompt([
    {
      type: "list",
      name: "role_id",
      message: "Select the updated role for the employee:",
      choices: roles.map((role) => ({
        name: role.title,
        value: role.id,
      })),
    },
  ]);

  const { role_id } = updatedRole;

  /* Updates the database for the employee with the new role */
  await db
    .promise()
    .query("UPDATE employee SET role_id = ? WHERE id = ?", [
      role_id,
      updateEmployee.employeeId,
    ]);

  console.log("The employees role was updated successfully!");
};

startMenu().catch((error) => {
  console.error("Oops, an error occurred:", error);
});
