import argon2 from "argon2";

async function hashPassword(password) {

  if (!password) {
    throw new Error("Password required");
  }

  return await argon2.hash(password);
}

async function verifyPassword(password, userHashedPassword) {

  if (!password || !userHashedPassword) {
    return false;
  }

  return await argon2.verify(password, userHashedPassword);
}

export const auth = {
  hashPassword,
  verifyPassword
};