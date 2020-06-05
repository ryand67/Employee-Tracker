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
            removeEmployee();
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

const removeEmployee = () => {
    connection.query('SELECT * FROM employee', (err, result) => {
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