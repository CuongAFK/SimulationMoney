const { exec } = require('child_process'); 
const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục public trong game-simulation
const publicDir = path.join(__dirname, '..', 'game-simulation', 'public'); // Thư mục public nằm trong game-simulation

const PORT = 3000; // Port của backend

// Thêm cờ -T vào lệnh ssh để tắt pseudo-terminal allocation
const serveo = exec(`ssh -T -R 80:localhost:${PORT} serveo.net`);

serveo.stdout.on('data', (data) => {
  console.log(data);

  // Tìm kiếm URL từ dữ liệu
  const urlRegex = /Forwarding HTTP traffic from (https?:\/\/[^\s]+)/;
  const match = data.match(urlRegex);

  if (match && match[1]) {
    const serveoUrl = match[1];
    console.log(`Serveo URL: ${serveoUrl}`);

    // Lưu URL vào file serveo-url.json trong thư mục public
    const serveoUrlPath = path.join(publicDir, 'serveo-url.json'); // Đường dẫn đến thư mục public
    const jsonData = JSON.stringify({ backendUrl: serveoUrl });

    fs.writeFile(serveoUrlPath, jsonData, (err) => {
      if (err) {
        console.error('Lỗi khi lưu URL vào serveo-url.json:', err);
      } else {
        console.log(`URL đã được lưu vào serveo-url.json: ${serveoUrl}`);
      }
    });
  }
});

serveo.stderr.on('data', (data) => {
  console.error(`Lỗi: ${data}`);
});

serveo.on('close', (code) => {
  console.log(`Kết thúc với mã: ${code}`);
});

























//localhost.run

// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// // Đường dẫn đến thư mục public trong game-simulation
// const publicDir = path.join(__dirname, '..', 'game-simulation', 'public'); // Thư mục public nằm trong game-simulation

// const PORT = 3000; // Port của backend

// // Sử dụng localhost.run để tạo đường hầm
// const tunnel = exec(`ssh -R 80:localhost:${PORT} localhost.run`);

// // Lắng nghe dữ liệu trả về
// tunnel.stdout.on('data', (data) => {
//   console.log(data); // In ra toàn bộ dữ liệu để kiểm tra

//   // Tìm kiếm URL từ dữ liệu trả về của localhost.run
//   const urlRegex = /(https?:\/\/[a-zA-Z0-9.-]+\.lhr\.life)/; // Regex khớp với URL trả về
//   const match = data.match(urlRegex);

//   if (match && match[1]) {
//     const tunnelUrl = match[1];
//     console.log(`Localhost.run URL: ${tunnelUrl}`);

//     // Lưu URL vào file serveo-url.json trong thư mục public
//     const urlPath = path.join(publicDir, 'serveo-url.json'); // Đường dẫn đến thư mục public
//     const jsonData = JSON.stringify({ backendUrl: tunnelUrl });

//     // Ghi vào file JSON
//     fs.writeFile(urlPath, jsonData, (err) => {
//       if (err) {
//         console.error('Lỗi khi lưu URL vào serveo-url.json:', err);
//       } else {
//         console.log(`URL đã được lưu vào serveo-url.json: ${tunnelUrl}`);
//       }
//     });
//   } else {
//     console.log("Không tìm thấy URL trong dữ liệu trả về."); // Thông báo nếu không tìm thấy URL
//   }
// });

// // Lắng nghe lỗi
// tunnel.stderr.on('data', (data) => {
//   console.error(`Lỗi: ${data}`);
// });

// // Lắng nghe khi kết thúc
// tunnel.on('close', (code) => {
//   console.log(`Kết thúc với mã: ${code}`);
// });
