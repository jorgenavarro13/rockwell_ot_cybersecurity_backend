import argon2 from "argon2";

async function hashPassword(password) {

  if (!password) {
    throw new Error("Password required");
  }

  return await argon2.hash(password);
}

// Recuerda que no se puede des-hashear una contraseña, es por ello que lo único que puedes hacer es comparar si volviendolo a hashear es lo mismo
async function verifyPassword(password, userHashedPassword) {

  if (!password || !userHashedPassword) {
    return false;
  }

  return await argon2.verify( userHashedPassword, password);
}

export const auth = {
  hashPassword,
  verifyPassword
};  