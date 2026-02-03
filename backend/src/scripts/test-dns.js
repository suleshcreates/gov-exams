
const dns = require('dns');

console.log('Testing DNS resolution for api.emailjs.com...');

try {
    if (dns.setDefaultResultOrder) {
        console.log('Setting ipv4first...');
        dns.setDefaultResultOrder('ipv4first');
    }
} catch (e) {
    console.log('dns.setDefaultResultOrder not supported');
}

dns.lookup('api.emailjs.com', (err, address, family) => {
    if (err) {
        console.error('DNS Lookup Failed:', err);
    } else {
        console.log('DNS Lookup Success!');
        console.log('Address:', address);
        console.log('Family:', family);
    }
});
