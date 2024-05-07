const express = require("express");
const logger = require("morgan");
const { Pool } = require('pg')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
})


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));


/// endpoints
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


app.post('/users', async (req , res)=>{
  
  // validar que el usuario no exista en la base de datos

  const {name,email,password} = req.body;
  const id = uuidv4();

  if(!name || !email || !password){
    return res.status(400).send("Faltan campos");
  }

  const userExists = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

  if (userExists.rows.length > 0) {
    return res.status(400).send("El usuario ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // crear usuario 
  try{
     await pool.query(
      `INSERT INTO users (id, name, email, password) 
       VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      [id, name, email, hashedPassword]) ;
    res.status(201).json({
        message:'Usuario creado correctamente',
    })
    
  }catch(e){
    console.log(e);
    res.status(500).send('Hubo un error intentando crear el usuario')
  }

});

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running ${process.env.PORT}`);
})


