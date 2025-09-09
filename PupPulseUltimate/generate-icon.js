const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a 1024x1024 canvas
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Create gradient background
const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
gradient.addColorStop(0, '#4CAF50');
gradient.addColorStop(1, '#2E7D32');

// Draw background
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1024, 1024);

// Draw rounded rectangle (iOS app icon style)
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.roundRect(0, 0, 1024, 1024, 200);
ctx.fill();

// Draw dog head (simplified)
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(512, 400, 120, 0, 2 * Math.PI);
ctx.fill();

// Draw ears
ctx.beginPath();
ctx.arc(450, 320, 40, 0, 2 * Math.PI);
ctx.fill();
ctx.beginPath();
ctx.arc(574, 320, 40, 0, 2 * Math.PI);
ctx.fill();

// Draw eyes
ctx.fillStyle = '#333';
ctx.beginPath();
ctx.arc(490, 380, 15, 0, 2 * Math.PI);
ctx.fill();
ctx.beginPath();
ctx.arc(534, 380, 15, 0, 2 * Math.PI);
ctx.fill();

// Draw nose
ctx.fillStyle = '#333';
ctx.beginPath();
ctx.arc(512, 420, 8, 0, 2 * Math.PI);
ctx.fill();

// Draw mouth
ctx.strokeStyle = '#333';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(512, 440, 30, 0, Math.PI);
ctx.stroke();

// Draw heartbeat symbol
ctx.fillStyle = '#FF6B6B';
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.fillText('♥', 800, 300);

// Draw pulse lines
ctx.fillStyle = 'white';
for (let i = 0; i < 5; i++) {
    const x = 200 + i * 40;
    const height = 40 + Math.sin(i) * 20;
    ctx.fillRect(x, 600, 20, height);
}

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./assets/icon.png', buffer);

console.log('✅ App icon generated successfully!');
console.log('📱 Icon saved as: assets/icon.png (1024x1024)');
