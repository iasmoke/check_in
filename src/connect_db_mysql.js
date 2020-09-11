 var mysql = require('mysql');
 var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'u_pizzaday',
    password : 'Max_7241915_Pizzaday',
    database : 'pizza_day_personal',
    charset : 'utf8mb4'
  })

  module.exports = connection
