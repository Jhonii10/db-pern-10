const express = require("express");
const logger = require("morgan");
require('dotenv').config()
const pool = require("./database/config");
const userRoutes = require("./routes/userRoutes")

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.get('/', (req, res) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Servidor Express</title>
</head>
<body>
  <h1>Server in express</h1>
</body>
</html>
`;

  res.send(htmlContent);
});

app.get('/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      const users = result.rows;
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al obtener usuarios');
    }
  });

/**
 * Endpoints
 */
app.use('/api/auth', userRoutes )


app.listen(process.env.PORT, ()=>{
    console.log(`Server is running ${process.env.PORT}`);
})


