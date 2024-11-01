import nodemailer from 'nodemailer';

const emailRegistro = async(datos) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      const {nombre,email,token}=datos;
      //Enviar el email
      await transport.sendMail({
        from:'Bienes Raíces.com',
        to:email,
        subject:'Confirma tu cuenta en Bienes Raíces',
        text:'Confirma tu cuenta en Bienes Raíces',
        html:`
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaíces.com</p>
            <p>Tu cuenta ya está lista, sólo debes confirmarla en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a>
            </p>
            <p>Si tu no creaste esta cuenta, puedes borrar el mensaje</p>
        `

      })
}


const emailOlvidePassword = async(datos) => {

  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const {nombre,email,token}=datos;
    //Enviar el email
    await transport.sendMail({
      from:'Bienes Raíces.com',
      to:email,
      subjet:'Restablece tu password en Bienes Raíces',
      text:'Restablece tu password en Bienes Raíces',
      html:`
          <p>Hola ${nombre}, has solicitado restablecer tu contraseña </p>
          <p>Da click en el siguiente enlace para restablecer tu contraseña: 
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer contraseña</a>
          </p>
          <p>Si tu no solicitaste el cambio de contraseña, puedes ignorar el email</p>
      `

    })
}
 
export {emailRegistro,emailOlvidePassword};