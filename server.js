const mysql = require("mysql2");
const cTable = require("console.table");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "employee_db",
});

const promptMenu = () => {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.menu) {
        case "View all departments":
          selectDepartments();
          break;
        case "View all roles":
          selectRoles();
          break;
        case "View all employees":
          selectEmployees();
          break;
        case "Add a department":
          addDeparment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateRole();
          break;

        default:
          "Exit";
          connection.end();
          break;
      }
    });
};

const selectDepartments = () => {
  connection.query("SELECT * FROM department;", (err, results) => {
    console.table(results);
    promptMenu();
  });
};

const selectRoles = () => {
  connection.query("SELECT * FROM role;", (err, results) => {
    console.table(results);
    promptMenu();
  });
};

const selectEmployees = () => {
  connection.query(
    "SELECT E.id, E.first_name, E.last_name, R.title, D.name AS deparment, R.salary, CONCAT(M.first_name,' ',M.last_name) AS managerFROM employee E JOIN role R ON E.role_id = R.id JOIN department D ON R.department_id = D.id LEFT JOIN employee M ON E.manager_id = M.id",
    (err, results) => {
      console.table(results);
      promptMenu();
    }
  );
};

const addDeparment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Name the deparment you would like to add",
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
    .then((name) => {
      connection.promise().query("INSERT INTO department SET ?", name);
      selectDepartments();
    });
};

const addRole = () => {
  return connection
    .promise()
    .query("SELECT department.id, department.name FROM department;")
    .then(([departments]) => {
      let departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id,
      }));

      inquirer
        .prompt([
          {
            type: "input",
            name: "title",
            message: "Enter the name of your title (Required)",
            validate: (titleName) => {
              if (titleName) {
                return true;
              } else {
                console.log("Please enter your title name!");
                return false;
              }
            },
          },
          {
            type: "list",
            name: "department",
            message: "Which department are you from?",
            choices: departmentChoices,
          },
          {
            type: "input",
            name: "salary",
            message: "Enter your salary (Required)",
            validate: (salary) => {
              if (salary) {
                return true;
              } else {
                console.log("Please enter your salary!");
                return false;
              }
            },
          },
        ])
        .then(({ title, department, salary }) => {
          const query = connection.query(
            "INSERT INTO role SET ?",
            {
              title: title,
              department_id: department,
              salary: salary,
            },
            function (err, res) {
              if (err) throw err;
            }
          );
        })
        .then(() => selectRoles());
    });
};

const addEmployee = () => {}
const updateRole = () => {}
