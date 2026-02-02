const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

async function migratePasswords() {
    const usersFile = path.join(__dirname, 'users.json');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    
    console.log('Migrating passwords for', users.length, 'users...\n');
    
    const saltRounds = 10;
    
    for (let user of users) {
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (user.password.startsWith('$2b$')) {
            console.log(`✓ ${user.email} - already hashed, skipping`);
            continue;
        }
        
        console.log(`→ Hashing password for ${user.email}`);
        user.password = await bcrypt.hash(user.password, saltRounds);
        console.log(`✓ ${user.email} - hashed successfully`);
    }
    
    // Save the updated users
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
    console.log('\n✅ All passwords migrated successfully!');
}

migratePasswords().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
