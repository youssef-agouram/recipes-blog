const r = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
console.log('Result:', 'https://www.youtube.com/watch?v=9wt6NjN4oA8'.match(r));
