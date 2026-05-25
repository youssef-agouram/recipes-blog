import fetch from 'node-fetch'; // wait, node-fetch might not be installed, we can use built-in fetch or standard http request since node 18+ has global fetch!

async function test() {
  try {
    const response = await fetch('http://localhost:4000/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'newuser@gmail.com' }),
    });
    console.log('STATUS:', response.status);
    console.log('BODY:', await response.text());
  } catch (error) {
    console.error('FETCH ERROR:', error);
  }
}

test();
