const bcrypt = require('bcryptjs');

const passwordToHash = 'superadminpass'; // <-- REPLACE WITH YOUR DESIRED ADMIN PASSWORD

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(passwordToHash, salt, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        }
        console.log('Password to hash:', passwordToHash);
        console.log('Generated Hash:', hash);
        console.log('\nCopy this hash and paste it into your backend/.env file for SUPER_ADMIN_PASSWORD_HASH');
    });
});