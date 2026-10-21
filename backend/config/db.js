const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'eduvault'
});

connection.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err.message);
        return;
    }

    console.log('MySQL connected successfully!');
});

module.exports = connection;