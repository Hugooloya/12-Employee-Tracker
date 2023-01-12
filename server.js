const inquirer = require("inquirer");
const mysql = require("mysql2");
const ct = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "employee_db",
  password: "Just123",
});

const prompt = () => {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add Department",
          "Add Role",
          "Add Employee",
          "Update Employee Role",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.menu) {
        case "View All Departments":
          viewAllDepartments();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "View All Employees":
          viewEmployees();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateRole();
          break;
        default:
          process.exit();
      }
    });
};

const viewAllDepartments = () => {
  connection.query("SELECT * FROM department;", (err, results) => {
    if (err) throw err;
    ct(results);
    prompt();
  });
};

viewRoles = () => {
  connection.query(
    "SELECT roles.id, roles.title, department.name AS department, roles.salary FROM roles INNER JOIN department ON roles.department_id = department.id;",
    (err, results) => {
      if (err) throw err;
      ct(results);
      prompt();
    }
  );
};

const viewEmployees = () => {
  connection.query(
    'SELECT employees.id, employees.first_name, employees.last_name, roles.title, department.name AS department, roles.salary, CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employees manager ON employees.manager_id = manager.id;',
    (err, results) => {
      if (err) throw err;
      ct(results);
      prompt();
    }
  );
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "dptName",
        message: "What is the name of the department?",
        validate: (departmentName) => {
          if (departmentName) {
            return true;
          } else {
            console.log("Please enter the name of your department");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department (name) VALUES (?);",
        answer.dptName,
        (err) => {
          if (err) throw err;
          console.log("Added " + answer.dptName + " to the database");
        }
      );
    });
};

const addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What is the name of the role?",
        validate: (addRole) => {
          if (addRole) {
            return true;
          } else {
            console.log("Please enter a role");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this role?",
        validate: (addSalary) => {
          if (addSalary) {
            return true;
          } else {
            console.log("Please enter a salary");
            return false;
          }
        },
      },
    ])
    .then((userInput) => {
      connection.query("SELECT name, id FROM department;", (err, results) => {
        if (err) throw err;

        let addDept = results.map(({ id, name }) => ({
          value: id,
          name: name,
        }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "department",
              message: "Which department does the role belong to?",
              choices: addDept,
            },
          ])
          .then((answers) => {
            connection.query(
              "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?);",
              [userInput.role, userInput.salary, answers.department],
              (err) => {
                if (err) throw err;
                console.log("Added " + userInput.role + " to the database");
                prompt();
              }
            );
          });
      });
    });
};

const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "First",
        message: "What is the employee's first name?",
        validate: (firstName) => {
          if (firstName) {
            return true;
          } else {
            console.log("Please enter employee's first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "Last",
        message: "What is the employee's last name?",
        validate: (lastName) => {
          if (lastName) {
            return true;
          } else {
            console.log("Please enter employee's last name");
            return false;
          }
        },
      },
    ])
    .then((userInput) => {
      connection.query(
        "SELECT roles.id, roles.title FROM roles;",
        (err, results) => {
          if (err) throw err;

          let addEmp = results.map(({ id, title }) => ({
            value: id,
            name: title,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's role?",
                choices: addEmp,
              },
            ])
            .then((empRole) => {
              connection.query("SELECT * FROM employees;", (err, results) => {
                if (err) throw err;
                let mngrs = results.map(({ id, first_name, last_name }) => ({
                  name: first_name + " " + last_name,
                  value: id,
                }));
                inquirer
                  .prompt([
                    {
                      type: "list",
                      name: "manager",
                      message: "What is the employee's manager?",
                      choices: mngrs,
                    },
                  ])
                  .then((empMngr) => {
                    connection.query(
                      "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUE (?, ?, ?, ?);",
                      [
                        userInput.First,
                        userInput.Last,
                        empRole.role,
                        empMngr.manager,
                      ],
                      (err) => {
                        if (err) throw err;
                        console.log(
                          "Added " +
                            userInput.First +
                            " " +
                            userInput.Last +
                            " to the database"
                        );
                      }
                    );
                  });
              });
            });
        }
      );
    });
};

const updateRole = () => {
  connection.query("SELECT * FROM employees;", (err, results) => {
    if (err) throw err;

    let employees = results.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));
    inquirer
      .prompt([
        {
          type: "list",
          name: "update",
          message: "Which employee's role do you want to update?",
          choices: employees,
        },
      ])
      .then((userChoice) => {
        connection.query("SELECT * FROM roles;", (err, results) => {
          if (err) throw err;
          let roles = results.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message:
                  "Which role do you want to assign the selected employee",
                choices: roles,
              },
            ])
            .then((roleSelect) => {
              connection.query(
                "UPDATE employees SET role_id = ? WHERE id = ?;",
                [userChoice.update, roleSelect.role],
                (err) => {
                  if (err) throw err;
                  console.log("Updated employees role");
                  prompt();
                }
              );
            });
        });
      });
  });
};
prompt();
