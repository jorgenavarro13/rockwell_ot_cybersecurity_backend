import pg from '../db.js';

const roleList = ['admin', 'user']

export async function seedRoles() {
    for (const role of roleList) {
        await pg`
        INSERT INTO roles (description)
        VALUES (${role})
        `;
        console.log(`${role}`);
    }
}

seedRoles();