import jwt from 'jsonwebtoken';

export const tokenParser = () => (req, res, next) => {
  const token = req.cookies.token

  let data = null

  req.session = {user : null} // Este es un objeto que yo cree para almacenar la info, podría ser alguna otra cosa

  try{
    data = jwt.verify(token,process.env.SECRET_JWT_KEY); // Verificamos la cookie

    req.session.user = data;

  } catch{}

  next() // Seguir al siguiente middleware
}
