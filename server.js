const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

let positions = ['Accountant', 'Sales Lead', 'Intern', 'Junior Developer', 'Senior Developer', 'Graphic Designer', 'Laywer'];

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
            removeEmployee();
        } else if(response.choice === 'View All Employees') {
            dbSearch('id');
        } else if(response.choice === 'Update Employee Role') {
            updateEmployee('role');
        } else if(response.choice === 'Update Employee Manager') {
            updateEmployee('manager');
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
        choices: positions,
        name: 'role'
    }
    ]).then((response) => {
        let roleId = positions.indexOf(response.role) + 1;
        connection.query('INSERT INTO employee SET ?', {
            first_name: response.firstName,
            last_name: response.lastName,
            role_id: roleId
        }, (err, results) => {
            if(err) throw err;
        })
        startApp();
    })
}

const removeEmployee = () => {
    connection.query('SELECT * FROM employee', (err, result) => {
        if(err) throw err;
        inquirer.prompt([{
            type: 'list',
            message: 'Which employee would you like to remove?',
            name: 'choice',
            choices: () => {
                let choiceArr = [];
                for(let i = 0; i < result.length; i++) {
                    choiceArr.push(`${result[i].first_name} ${result[i].last_name}`);
                }
                return choiceArr;
            }
        }]).then((response) => {
            let choiceName = response.choice.split(' ')[0];
            connection.query('DELETE FROM employee WHERE first_name=?', [choiceName], (err, result) => {
                if(err) throw err;
                resetID();
                startApp();
            })
        })
    })
}

const resetID = () => {
    connection.query('SELECT * FROM employee', (err, result) => {
        if(err) throw err;
        let backup = [];
        for(let i = 0; i < result.length; i++) {
            let holder = {
                first_name: result[i].first_name,
                last_name: result[i].last_name,
                role_id: result[i].role_id
            }
            backup.push(holder);
        }
        connection.query('TRUNCATE TABLE employee', (err) => {
            if(err) throw err;
            connection.query('INSERT INTO employee SET ?', backup, (err) => {
                if(err) throw err;
            })
        })
    })
}

const dbSearch = (query) => {
    connection.query('SELECT * FROM employee ORDER BY ?', query, (err, result) => {
        if(err) throw err;
        console.table(result);
        setTimeout(startApp, 1000);
    })
}

const updateEmployee = (query) => {
    connection.query('SELECT * FROM employee', (err, result) => {
        if(err) throw err;
        inquirer.prompt([{
            type: 'list',
            message: 'Which employee do you want to update?',
            name: 'choice',
            choices: () => {
                let choiceArr = [];
                for(let i = 0; i < result.length; i++) {
                    choiceArr.push(`${result[i].id} ${result[i].first_name} ${result[i].last_name}`);
                }
                return choiceArr;
            }
        }]).then((response) => {
            let choiceId = parseInt(response.choice.split(" ")[0]);
            if(query === 'role') {
                inquirer.prompt([{
                    type: 'list',
                    message: 'What role should this person be updated to?',
                    choices: positions,
                    name: 'role'
                }]).then((response) => {
                    let roleId = positions.indexOf(response.role) + 1;
                    connection.query('UPDATE employee SET role_id=? WHERE id=?', [roleId, choiceId], (err) => {
                        if (err) throw err;
                    })
                    startApp();
                })
            } else if(query === 'manager') {

            }
        })
    })
}