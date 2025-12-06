const bcrypt = require('bcrypt');

const storedHash = '$2a$12$PXWEC0VLmeHuLe6IiZ2YMeuMQsBHgqT0OwAWKJlRFoKDKsEiyVEpG';
const password = 'sulesh123'; // <-- Change this to your actual password

bcrypt.compare(password, storedHash).then(match => {
    console.log('Password matches hash:', match);
    if (!match) {
        console.log('\n❌ Hash does NOT match this password');
        console.log('Generate new hash for your password:');
        bcrypt.hash(password, 10).then(newHash => {
            console.log('\nNew hash:', newHash);
            console.log('\nRun this SQL:');
            console.log(`UPDATE admins SET password_hash = '${newHash}' WHERE email = 'suleshvi43@gmail.com';`);
        });
    } else {
        console.log('\n✅ Hash matches! Login should work.');
    }
});