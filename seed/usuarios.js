import bcrypt from 'bcrypt';

const usuarios=[
    {
        nombre:'David',
        email:'david@correo.com',
        confirmado:1,
        password:bcrypt.hashSync('password',10),

    }
]

export default usuarios;
