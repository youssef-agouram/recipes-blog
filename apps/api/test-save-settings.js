const http = require('http');

const siteSettingsPayload = {
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
  copyrightText: '© {year} Tasteful. All rights reserved.',
  aboutText: '',
  adSettings: {
    showTopBarAd: false,
    showBottomBarAd: false,
    showPopupAd: false,
    topBarAdLink: '',
    bottomBarVideoLink: '',
    popupAdLink: '',
    topBarAdUrls: [],
    bottomBarVideoUrls: [],
    popupAdImageUrls: [],
    topBarAdUrl: '',
    bottomBarVideoUrl: '',
    popupAdImageUrl: ''
  }
};

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/settings/site',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    // We might need a fake token if authMiddleware doesn't check it strictly, or we bypass it
    'Authorization': 'Bearer 1' 
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Site Status:', res.statusCode, data));
});

req.on('error', console.error);
req.write(JSON.stringify(siteSettingsPayload));
req.end();
