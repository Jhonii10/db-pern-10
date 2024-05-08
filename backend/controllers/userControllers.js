
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/config');


module.exports.register = async (req , res , next)=>{

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
    
    // Create user 
    try{
       await pool.query(
        `INSERT INTO users (id, name, email, password) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [id, name, email, hashedPassword]) ;
      res.status(201).json({
          status:true,
          message:'Usuario creado correctamente',
      })
      
    }catch(e){
      res.status(500).send('Hubo un error intentando crear el usuario')
    }
}