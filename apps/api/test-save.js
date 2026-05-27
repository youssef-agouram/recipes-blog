const http = require('http');

const payload = JSON.stringify({
  brandName: 'Tasteful',
  tagline: 'Delicious Recipes',
  stickyNavbar: true,
  showSearchBar: true,
  showAuthButtons: true,
  showTopBar: true,
  logoUrl: '',
  faviconUrl: '',
  footerLogoUrl: '',
  menuItems: [],
  profileMenu: [],
  socialLinks: [],
  copyrightText: '© 2026 Tasteful',
  aboutText: '',
  adSettings: {}
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/settings/site',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Data:', data));
});

req.on('error', console.error);
req.write(payload);
req.end();
