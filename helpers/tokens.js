
import jwt from 'jsonwebtoken';

const generarJwt=({id,nombre})=>{
    return jwt.sign({id,nombre},process.env.JWT_SECRET,{expiresIn:'1h'});
}


const generarId=()=>Math.random().toString(32).substring(2)+Date.now().toString(32);

export {generarId,generarJwt}