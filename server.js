//Imports mysql2, console.table, inquirer
const mysql2 = require("mysql2");
const cTable = require("console.table");
const inquirer = require("inquirer");

//Connection to database
const connection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Reincarnati0n!",
  database: "employees_db",
});
connection.connect((err) => {
  if (err) throw err;
  console.log("succefully connected to a database" + connection.threadId);
  firstPrompt();
});

// first action
const firstPrompt = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "task",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Update an employee manager",
          "View employees by department",
          "Delete a department",
          "Delete a role",
          "Delete an employee",
          "View department budgets",
          "No Action",
        ],
      },
    ])
    .then((answers) => {
      const { task } = answers;

      if (task === "View all departments") {
        showDepartments();
      }

      if (task === "View all roles") {
        showRoles();
      }

      if (task === "View all employees") {
        showEmployees();
      }

      if (task === "Add a department") {
        addDepartment();
      }

      if (task === "Add a role") {
        addRole();
      }

      if (task === "Add an employee") {
        addEmployee();
      }

      if (task === "Update an employee role") {
        updateEmployee();
      }

      if (task === "Update an employee manager") {
        updateManager();
      }

      if (task === "View employees by department") {
        employeeDepartment();
      }

      if (task === "Delete a department") {
        deleteDepartment();
      }

      if (task === "Delete a role") {
        deleteRole();
      }

      if (task === "Delete an employee") {
        deleteEmployee();
      }

      if (task === "View department budgets") {
        viewBudget();
      }

      if (task === "No Action") {
        connection.end();
      }
    });
};

// All departments
showDepartments = () => {
  console.log("Showing all departments...\n");
  const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    firstPrompt();
  });
};

//All roles
showRoles = () => {
  console.log("Showing all roles...\n");

  const sql = `SELECT roles.id, roles.title, department.department_name AS department
                 FROM roles
                 INNER JOIN department ON roles.department_id = department.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    firstPrompt();
  });
};

//All employees
showEmployees = () => {
  console.log("Showing all employees...\n");
  const sql = `SELECT employees.id, 
                        employees.first_name, 
                        employees.last_name, 
                        roles.title, 
                        department.department_name AS department,
                        roles.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                 FROM employees
                        LEFT JOIN roles ON employees.role_id = roles.id
                        LEFT JOIN department ON roles.department_id = department.id
                        LEFT JOIN employees manager ON employees.manager_id = manager.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    firstPrompt();
  });
};

addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addDept",
        message: "What department do you want to add?",
        validate: (addDept) => {
          if (addDept) {
            return true;
          } else {
            console.log("Please enter a department");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (department_name)
                    VALUES (?)`;
      connection.query(sql, answer.addDept, (err, result) => {
        if (err) throw err;
        console.log("Added " + answer.addDept + " to departments!");

        showDepartments();
      });
    });
};

addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What role do you want to add?",
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
    .then((answer) => {
      const params = [answer.role, answer.salary];

      const roleSql = `SELECT department_name, id FROM department`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "dept",
              message: "What department is this role in?",
              choices: dept,
            },
          ])
          .then((deptChoice) => {
            const dept = deptChoice.dept;
            params.push(dept);

            const sql = `INSERT INTO roles (title, salary, department_id)
                          VALUES (?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log("Added" + answer.role + " to roles!");

              showRoles();
            });
          });
      });
    });
};

addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "fistName",
        message: "What is the employee's first name?",
        validate: (addFirst) => {
          if (addFirst) {
            return true;
          } else {
            console.log("Please enter a first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: (addLast) => {
          if (addLast) {
            return true;
          } else {
            console.log("Please enter a last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const params = [answer.fistName, answer.lastName];

      const roleSql = `SELECT roles.id, roles.title FROM roles`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const roles = data.map(({ id, title }) => ({ name: title, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: roles,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            params.push(role);

            const managerSql = `SELECT * FROM employees`;

            connection.query(managerSql, (err, data) => {
              if (err) throw err;

              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));

              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager;
                  params.push(manager);

                  const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;

                  connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Employee has been added!");

                    showEmployees();
                  });
                });
            });
          });
      });
    });
};

updateEmployee = () => {
  const employeeSql = `SELECT * FROM employees`;

  connection.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((empChoice) => {
        const employee = empChoice.name;
        const params = [];
        params.push(employee);

        const roleSql = `SELECT * FROM roles`;

        connection.query(roleSql, (err, data) => {
          if (err) throw err;

          const roles = data.map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: roles,
              },
            ])
            .then((roleChoice) => {
              const role = roleChoice.role;
              params.push(role);

              let employee = params[0];
              params[0] = role;
              params[1] = employee;

              const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;

              connection.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");

                showEmployees();
              });
            });
        });
      });
  });
};

updateManager = () => {
  const employeeSql = `SELECT * FROM employees`;

  connection.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((empChoice) => {
        const employee = empChoice.name;
        const params = [];
        params.push(employee);

        const managerSql = `SELECT * FROM employees`;

        connection.query(managerSql, (err, data) => {
          if (err) throw err;

          const managers = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                name: "manager",
                message: "Who is the employee's manager?",
                choices: managers,
              },
            ])
            .then((managerChoice) => {
              const manager = managerChoice.manager;
              params.push(manager);

              let employee = params[0];
              params[0] = manager;
              params[1] = employee;

              const sql = `UPDATE employees SET manager_id = ? WHERE id = ?`;

              connection.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");

                showEmployees();
              });
            });
        });
      });
  });
};

employeeDepartment = () => {
  console.log("Showing employees by departments...\n");
  const sql = `SELECT employees.first_name, 
                        employees.last_name, 
                        department.department_name AS department
                 FROM employees 
                 LEFT JOIN roles ON employees.role_id = roles.id 
                 LEFT JOIN department ON roles.department_id = department.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    firstPrompt();
  });
};

deleteDepartment = () => {
  const deptSql = `SELECT * FROM department`;

  connection.query(deptSql, (err, data) => {
    if (err) throw err;

    const dept = data.map(({ name, id }) => ({ name: name, value: id }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "dept",
          message: "What department do you want to delete?",
          choices: dept,
        },
      ])
      .then((deptChoice) => {
        const dept = deptChoice.dept;
        const sql = `DELETE FROM department WHERE id = ?`;

        connection.query(sql, dept, (err, result) => {
          if (err) throw err;
          console.log("Successfully deleted!");

          showDepartments();
        });
      });
  });
};

deleteRole = () => {
  const roleSql = `SELECT * FROM roles`;

  connection.query(roleSql, (err, data) => {
    if (err) throw err;

    const role = data.map(({ title, id }) => ({ name: title, value: id }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "role",
          message: "What role do you want to delete?",
          choices: role,
        },
      ])
      .then((roleChoice) => {
        const role = roleChoice.role;
        const sql = `DELETE FROM roles WHERE id = ?`;

        connection.query(sql, role, (err, result) => {
          if (err) throw err;
          console.log("Successfully deleted!");

          showRoles();
        });
      });
  });
};

deleteEmployee = () => {
  const employeeSql = `SELECT * FROM employees`;

  connection.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to delete?",
          choices: employees,
        },
      ])
      .then((empChoice) => {
        const employee = empChoice.name;

        const sql = `DELETE FROM employees WHERE id = ?`;

        connection.query(sql, employee, (err, result) => {
          if (err) throw err;
          console.log("Successfully Deleted!");

          showEmployees();
        });
      });
  });
};

viewBudget = () => {
  console.log("Showing budget by department...\n");

  const sql = `SELECT department_id AS id, 
    department.department_name AS department,
                        SUM(salary) AS budget
                 FROM  roles  
                 JOIN department ON roles.department_id = department.id GROUP BY  department_id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);

    firstPrompt();
  });
};
