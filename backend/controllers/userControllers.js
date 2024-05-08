
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/config');
const { use } = require('../routes/userRoutes');


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


module.exports.login = async (req, res, next) =>{
    
      const {email, password} = req.body;
  
      if (!email || !password) {
          return res.status(400).json({message : 'Por favor ingresa tu correo y contraseña'});
        }

        try {

            const user = await pool.query('SELECT * FROM users WHERE email = $1',[email])
           
            if (user.rows.length === 0) {
                return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos', status:false});
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password);

            if (!validPassword) {
                return res.status(401).json({ message: 'Contraseña incorrecta', status:false });
            }

            res.json({
                status:true,
                user: {
                    id: user.rows[0].id,
                    name: user.rows[0].name,
                    email: user.rows[0].email
                }
            })
            
        } catch (error) {
            res.status(500).json({ message: 'Hubo un error al autenticar al usuario' });
        }
}