//Require modules
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

//Available positions to grab from
let positions = ['Accountant', 'Sales Lead', 'Design Intern', 'Junior Developer', 'Senior Developer', 'Graphic Designer', 'Laywer'];

//Create mysql connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'rootroot',
    database: 'employee_db'
});

//Connect to database and start app
connection.connect((err) => {
    if(err) throw err;
    startApp();
})

//Starts app
const startApp = () => {
    //Prompt user and ask what they'd like to do
    inquirer.prompt([{
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'View All Employees by Department', 'View All Employees by Role', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'View Total Utilized Budget', 'Exit'],
        name: 'choice'
    }]).then((response) => {
        //Trigger function based on menu option
        if(response.choice === 'Add Employee') {
            addEmployee();
        } else if(response.choice === "Exit") {
            connection.end();
        } else if(response.choice === "Remove Employee") {
            removeEmployee();
        } else if(response.choice === 'View All Employees') {
            dbSearch('employee.id');
        } else if(response.choice === 'Update Employee Role') {
            updateEmployee('role');
        } else if(response.choice === 'View All Employees by Department') {
            dbSearch('department.id');
        } else if(response.choice === 'View All Employees by Role') {
            dbSearch('role.id');
        } else if(response.choice === 'View Total Utilized Budget') {
            utilizedBudget();
        }
    })
}

//Add employee to the database
const addEmployee = () => {
    //Ask for employee info
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
        //Grab the corresponding role id to set in the object
        let roleId = positions.indexOf(response.role) + 1;
        //Create databse entry
        connection.query('INSERT INTO employee SET ?', {
            first_name: response.firstName,
            last_name: response.lastName,
            role_id: roleId
        }, (err, results) => {
            if(err) throw err;
        })
        //Go back to the main menu
        startApp();
    })
}

//Remove employee from database
const removeEmployee = () => {
    //Grab all entries to manipulate
    connection.query('SELECT * FROM employee', (err, result) => {
        if(err) throw err;
        //If there aren't any then go back to the main menu
        if(result.length === 0) {
            console.log(`Nothing to remove!`);
            startApp();
            return;
        }
        inquirer.prompt([{
            //Pick from the list of employees
            type: 'list',
            message: 'Which employee would you like to remove?',
            name: 'choice',
            choices: () => {
                let choiceArr = [];
                for(let i = 0; i < result.length; i++) {
                    //Broken up like this to split the id out of it
                    choiceArr.push(`${result[i].id} ${result[i].first_name} ${result[i].last_name}`);
                }
                return choiceArr;
            }
        }]).then((response) => {
            //Store the id as a variable
            let choiceId = parseInt(response.choice.split(' ')[0]);
            //Delete from the table using the grabbed id
            connection.query('DELETE FROM employee WHERE id=?', choiceId, (err) => {
                if(err) throw err;
                //Resets the id list and goes back to main menu
                resetID();
                startApp();
            })
        })
    })
}

//Resets the id so when an employee gets deleted so the list stays correct
const resetID = () => {
    //Grab all of the employees
    connection.query('SELECT * FROM employee', (err, result) => {
        if(err) throw err;
        //Create holder variable for the entries
        let backup = [];
        //Loops through the results, pushing each entry into the backup array
        for(let i = 0; i < result.length; i++) {
            let holder = {
                first_name: result[i].first_name,
                last_name: result[i].last_name,
                role_id: result[i].role_id
            }
            backup.push(holder);
        }
        //Remove all rows from the table
        connection.query('TRUNCATE TABLE employee', (err) => {
            if(err) throw err;
            //Insert into the table, the array of objects we just created, now with a reset auto incrememnt count for id
            connection.query('INSERT INTO employee SET ?', backup, (err) => {
                if(err) throw err;
            })
        })
    })
}

//View database function
const dbSearch = (query) => {
    //Grab name, role title, salary, and department name
    //Join the role table matching role_id with role.id
    //Join the department table where department_id equals department.id
    //Orders by the query passed into the function using a template literal because the placeholder wasn't working
    connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name FROM employee LEFT JOIN role ON employee.role_id=role.id INNER JOIN department ON role.department_id = department.id ORDER BY ${query}`, (err, result) => {
        if(err) throw err;
        //If there aren't any results display this message;
        if(result.length === 0) {
            console.log('NOTHING TO DISPLAY');
        }
        //console.table the results, wait one second to make sure the main menu rendering doesn't mess with the table rendering
        console.table(result);
        setTimeout(startApp, 1000);
    })
}

//Updates employee information
const updateEmployee = (query) => {
    //Grab database entries
    connection.query('SELECT * FROM employee', (err, result) => {
        if(err) throw err;
        //Find out which employee they want to edit, similar to the remove function
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
            //If they wanted to switch the role
            if(query === 'role') {
                inquirer.prompt([{
                    type: 'list',
                    message: 'What role should this person be updated to?',
                    choices: positions,
                    name: 'role'
                }]).then((response) => {
                    //Grab id like the remove function
                    let roleId = positions.indexOf(response.role) + 1;
                    //Update the employee entry
                    connection.query('UPDATE employee SET role_id=? WHERE id=?', [roleId, choiceId], (err) => {
                        if (err) throw err;
                    })
                    //Launch main menu
                    startApp();
                })
            } else if(query === 'manager') {

            }
        })
    })
}

//Console logs the total amount paid on salaries
const utilizedBudget = () => {
    //Grabs just salary for all employees
    connection.query('SELECT salary FROM employee LEFT JOIN role ON employee.role_id=role.id', (err, result) => {
        if(err) throw err;
        //Add each salary to total budget
        let totalBudget = 0;
        for(let i = 0; i < result.length; i++) {
            totalBudget += result[i].salary;
        }
        //Logs the total budget
        console.log(`TOTAL UTILIZED BUDGET ${totalBudget}`)
    })
    //Wait one second to launch main menu to not interfere with console logs
    setTimeout(startApp, 1000);
}