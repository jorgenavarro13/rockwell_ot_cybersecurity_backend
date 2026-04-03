import pg from '../db.js';

const typeUserList = ['Employee', 'Client', 'Not related']

export async function seedTypeUsers() {
    for (const typeUser of typeUserList) {
        await pg`
        INSERT INTO type_users (relation)
        VALUES (${typeUser})
        `;
        console.log(`${typeUser}`);
    }
}

seedTypeUsers();