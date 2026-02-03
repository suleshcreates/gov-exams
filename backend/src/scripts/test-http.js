
const https = require('https');

console.log('Testing connectivity using native https module...');

const options = {
    hostname: 'www.google.com',
    port: 443,
    path: '/',
    method: 'GET'
};

const req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
        // console.log(d.toString());
    });
});

req.on('error', (e) => {
    console.error('HTTPS Request Error:', e);
});

req.end();

// Also try Supabase domain
const sbOptions = {
    hostname: 'vepbxdvdfmcqwzzjkziq.supabase.co',
    port: 443,
    path: '/',
    method: 'GET'
};

const sbReq = https.request(sbOptions, (res) => {
    console.log('Supabase statusCode:', res.statusCode);
});

sbReq.on('error', (e) => {
    console.error('Supabase Request Error:', e);
});

sbReq.end();
