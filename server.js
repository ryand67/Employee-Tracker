const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'rootroot',
    database: 'employee_db'
});

connection.connect((err) => {
    if(err) throw err;
    startApp();
})

const startApp = () => {
    inquirer.prompt([{
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'View All Employees by Department', 'View All Employees by Role', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager', 'Exit'],
        name: 'choice'
    }]).then((response) => {
        if(response.choice === 'Add Employee') {
            addEmployee();
        } else if(response.choice === "Exit") {
            connection.end();
        } else if(response.choice === "Remove Employee") {
            
        }
    })
}

const addEmployee = () => {
    inquirer.prompt([{
        type: 'input',
        message: 'First name:',
        name: 'firstName'
    },{
        type: 'input',
        message: 'Last name:',
        name: 'lastName'
    },{
        type: 'list',
        message: 'Role:',
        choices: ['Intern', 'Junior Developer', 'Senior Developer'],
        name: 'role'
    }
    ]).then((response) => {
        let roleId;
        switch(response.role) {
            case 'Intern':
                roleId = 1;
                break;

            case 'Junior Developer':
                roleId = 2;
                break;

            case 'Senior Developer':
                roleId = 3;
                break;
        }
        connection.query('INSERT INTO employee SET ?', {
            first_name: response.firstName,
            last_name: response.lastName,
            role_id: roleId
        }, (err, results) => {
            if(err) throw err;
            for(let i = 0; i < results.length; i++) {
                results[i].id = i + 1;
            }
        })
        startApp();
    })
}