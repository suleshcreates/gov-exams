const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('==================================');
    console.log('Password:', password);
    console.log('Bcrypt Hash:');
    console.log(hash);
    console.log('==================================');
    console.log('\nCopy this hash and use it in the SQL migration file.');
}

generateHash().catch(console.error);
