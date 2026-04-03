import {seedCountries} from './seeds/contries_seed.js'
import {seedTypeUsers} from './seeds/typeUsers_seed.js'
import {seedRoles} from './seeds/roles_seed.js'

async function seedDatabase() {
    try {
        await seedCountries();
        await seedTypeUsers();
        await seedRoles();
        console.log('Database seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding the database:', error);
    }
}

seedDatabase();