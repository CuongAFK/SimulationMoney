const express = require('express');
const sql = require('mssql'); // Import thư viện mssql
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Để đọc request body

app.use(cors({
    origin: '*', // Cho phép tất cả nguồn (không an toàn cho sản phẩm)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cấu hình SQL Server
const config = {
    server: 'TUANCUONG\\SQLEXPRESS01',
    database: 'MoneySimulatorDB',
    user: 'money_simulator_admin',  // Tên tài khoản SQL Server
    password: 'Admin2024$',         // Mật khẩu tương ứng
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};





// Tạo hàm async để kết nối SQL
async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Kết nối thành công tới SQL Server');
    } catch (err) {
        console.error('Kết nối thất bại:', err);
    }
}

// Gọi hàm kết nối
connectToDatabase();



const axios = require('axios'); // Sử dụng axios để gửi HTTP request



// Route đăng ký
const bcrypt = require('bcrypt');

// Route đăng ký
app.post('/register', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ ID và mật khẩu' });
    }

    try {
        // Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kết nối đến database
        const request = new sql.Request();

        // Query để thêm người dùng vào bảng NguoiDung
        const query = `INSERT INTO NguoiDung (id, matKhau) VALUES (@id, @password)`;

        // Thiết lập các tham số đầu vào
        request.input('id', sql.VarChar, id);
        request.input('password', sql.VarChar, hashedPassword); // Lưu mật khẩu đã băm

        // Thực hiện câu lệnh thêm vào bảng NguoiDung
        await request.query(query);

        res.status(200).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: 'Lỗi đăng ký', error });
    }
});


// Route đăng nhập
app.post('/login', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ ID và mật khẩu' });
    }

    try {
        const request = new sql.Request();

        // Lấy thông tin từ bảng NguoiDung và ThongTin bằng JOIN
        const query = `
            SELECT N.*, T.biCam 
            FROM NguoiDung N
            LEFT JOIN ThongTin T ON N.id = T.id
            WHERE N.id = @id
        `;

        // Chuyển đổi kiểu dữ liệu cho id từ sql.VarChar sang sql.VarChar
        request.input('id', sql.VarChar, id);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'ID không tồn tại.' });
        }

        const user = result.recordset[0];
        console.log('User Info:', user); // In ra thông tin người dùng

        // Kiểm tra xem tài khoản có bị cấm không
        if (user.biCam) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị cấm!' });
        }

        // So sánh mật khẩu đã băm
        const match = await bcrypt.compare(password, user.matkhau);
        if (!match) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }

        res.status(200).json({ message: 'Đăng nhập thành công!' });
    } catch (error) {
        console.error('Lỗi khi đăng nhập', error);
        res.status(500).json({ message: 'Có lỗi xảy ra.', error });
    }
});




// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chạy trên cổng ${PORT}`);
});


// Route lấy thông tin người dùng
app.post('/personal-info', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Vui lòng cung cấp ID người dùng' });
    }

    try {
        const request = new sql.Request();

        // Truy vấn ThongTin để lấy thông tin tiền, tuổi, giới tính, và ngày sinh
        const userInfoQuery = `
            SELECT ten, tien, tongGiaTriTaiSan, ngaySinh, tuoi, gioiTinh
            FROM ThongTin
            WHERE id = @id
        `;
        request.input('id', sql.VarChar, id); // Khai báo tham số id cho truy vấn đầu tiên
        const userInfoResult = await request.query(userInfoQuery);

        if (userInfoResult.recordset.length === 0) {
            // Nếu không có thông tin người dùng thì trả về mặc định
            return res.status(200).json({
                id,
                ten: '',
                tien: 0,
                giaTriTaiSan: 0,
                tuoi: 0,
                gioiTinh: '',
                ngaySinh: null,
                taiSan: [] // Mặc định rỗng nếu chưa có tài sản
            });
        }

        const userInfo = userInfoResult.recordset[0];

        // Truy vấn CTTS để lấy thông tin chi tiết tài sản của người dùng
        const assetDetailsQuery = `
            SELECT T.ten, CT.soLuong, T.giaTri
            FROM ChiTietTaiSan CT
            JOIN TaiSan T ON CT.ma = T.ma
            WHERE CT.id = @id
        `;
        // Chỉ cần gán lại giá trị cho cùng một tham số đã khai báo trước đó
        // Không cần phải khai báo lại input 'id'
        const assetDetailsResult = await request.query(assetDetailsQuery);

        const taiSan = assetDetailsResult.recordset.map(asset => ({
            ten: asset.ten,
            soLuong: asset.soLuong,
            giaTri: asset.giaTri
        }));

        // Trả về dữ liệu người dùng
        res.status(200).json({
            id,
            ten: userInfo.ten || '',
            tien: userInfo.tien || 0,
            giaTriTaiSan: userInfo.giaTriTaiSan || 0,
            tuoi: userInfo.tuoi || 0, // Thêm tuổi
            gioiTinh: userInfo.gioiTinh || '', // Thêm giới tính
            ngaySinh: userInfo.ngaySinh || null, // Thêm ngày sinh
            taiSan: taiSan.length ? taiSan : [] // Nếu không có tài sản thì mặc định là rỗng
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy thông tin người dùng.', error });
    }
});




app.post('/save-personal-info', async (req, res) => {
    console.log('Thông tin nhận được từ frontend:', req.body); // Log thông tin nhận được

    const { id, ten, tien, tuoi, gioiTinh, ngaySinh } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID là bắt buộc' });
    }

    try {
        const request = new sql.Request();
        const updates = [];
        const parameters = [];

        // Kiểm tra từng trường và thêm vào câu lệnh cập nhật nếu có giá trị
        if (ten) {
            updates.push(`ten = @ten`);
            parameters.push({ name: 'ten', value: ten, type: sql.NVarChar });
        }
        if (tien !== undefined) {
            updates.push(`tien = @tien`);
            parameters.push({ name: 'tien', value: tien, type: sql.Int });
        }
        if (tuoi !== undefined) {
            updates.push(`tuoi = @tuoi`);
            parameters.push({ name: 'tuoi', value: tuoi, type: sql.Int });
        }
        if (gioiTinh) {
            updates.push(`gioiTinh = @gioiTinh`);
            parameters.push({ name: 'gioiTinh', value: gioiTinh, type: sql.NVarChar });
        }
        if (ngaySinh) {
            updates.push(`ngaySinh = @ngaySinh`);
            parameters.push({ name: 'ngaySinh', value: ngaySinh, type: sql.Date });
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
        }

        // Kiểm tra xem thông tin người dùng có tồn tại không
        const checkUserQuery = `SELECT COUNT(*) AS count FROM ThongTin WHERE id = @id`;
        request.input('id', sql.VarChar, id); // Sử dụng sql.VarChar
        const userCheckResult = await request.query(checkUserQuery);
        if (userCheckResult.recordset[0].count === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
        }

        // Xây dựng câu lệnh SQL
        const query = `UPDATE ThongTin SET ${updates.join(', ')} WHERE id = @id`;
        parameters.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        await request.query(query);

        res.status(200).json({ success: true, message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật thông tin.', error: error.message });
    }
});




app.post('/ban-account', async (req, res) => {
    const { id, adminId } = req.body;

    console.log('Request body:', req.body); // Log thông tin từ request

    // Kiểm tra quyền admin
    if (adminId !== 'CuongAFK') {
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này.' });
    }

    try {
        const request = new sql.Request();

        // Lấy thông tin hiện tại của tài khoản từ bảng ThongTin
        const checkUserQuery = `SELECT biCam FROM ThongTin WHERE id = @id`;
        request.input('id', sql.VarChar, id); // Đảm bảo id là kiểu VARCHAR như đã định nghĩa

        const userCheckResult = await request.query(checkUserQuery);

        if (userCheckResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
        }

        const currentStatus = userCheckResult.recordset[0].biCam;

        // Chuyển đổi trạng thái (từ cấm sang mở lại hoặc ngược lại)
        const newStatus = !currentStatus; 

        // Cập nhật trạng thái tài khoản
        const updateQuery = `UPDATE ThongTin SET biCam = @biCam WHERE id = @id`;
        await request
            .input('biCam', sql.Bit, newStatus) // Gán trạng thái mới
            .query(updateQuery);

        res.status(200).json({ message: `Tài khoản đã được ${newStatus ? 'cấm' : 'mở lại'} thành công.` });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái tài khoản:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi thực hiện thao tác này.', error });
    }
});

  


app.get('/user-list', async (req, res) => {
    try {
        const request = new sql.Request();

        // Truy vấn các trường trong bảng `ThongTin` với tên mới
        const query = 'SELECT id, ten FROM ThongTin';

        const result = await request.query(query);

        res.status(200).json(result.recordset); // Trả về danh sách người dùng
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách người dùng.' });
    }
});


app.post('/search-user', async (req, res) => {
    const { query } = req.body;

    try {
        const request = new sql.Request();
        
        let sqlQuery = `SELECT id, ten, Tien, biCam FROM ThongTin`;

        console.log('Received query from frontend:', query);
        // Nếu có từ khóa tìm kiếm, thêm điều kiện `WHERE`
        if (query) {
            sqlQuery += ` WHERE id LIKE @query OR ten LIKE @query`; // `ten` là tên trường mới
            request.input('query', sql.NVarChar, `%${query}%`); // Dùng `NVarChar` cho các trường có kiểu NVARCHAR
        }

        const result = await request.query(sqlQuery);
        res.status(200).json(result.recordset); // Trả về kết quả tìm kiếm
    } catch (error) {
        console.error('Lỗi khi tìm kiếm người dùng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi tìm kiếm người dùng.' });
    }
});


app.get('/user/:userId', async (req, res) => {
    const userIdParam = req.params.userId; // Lấy tham số từ URL

    // Kiểm tra đầu vào để tránh lỗi hoặc tấn công SQL injection
    if (!userIdParam || typeof userIdParam !== 'string' || userIdParam.trim() === '') {
        return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
    }

    try {
        const request = new sql.Request();
        request.input('userId', sql.VarChar, userIdParam); // Đảm bảo an toàn bằng cách sử dụng input parameters

        // Truy vấn thông tin từ bảng ThongTin
        const query = `SELECT id, ten, ngaySinh, gioiTinh, tien, tuoi, biCam FROM ThongTin WHERE id = @userId`;
        const result = await request.query(query);

        // Kiểm tra nếu không tìm thấy người dùng
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        const userInfo = result.recordset[0];
        res.status(200).json(userInfo); // Trả về thông tin người dùng
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy thông tin người dùng.', error });
    }
});


// Xóa người dùng dựa trên ID
app.delete('/user/:id', async (req, res) => {
    const userId = req.params.id; // Lấy ID người dùng từ tham số URL
    try {
        // Sử dụng câu truy vấn DELETE để xóa người dùng
        const query = `DELETE FROM NguoiDung WHERE id = @userId`;
        const request = new sql.Request(); // Tạo yêu cầu mới
        request.input('userId', sql.VarChar, userId); // Thêm tham số vào truy vấn

        const result = await request.query(query);

        // Kiểm tra xem có dòng nào bị xóa hay không
        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Xóa tài khoản thành công.' });
        } else {
            res.status(404).send({ message: 'Không tìm thấy người dùng.' });
        }
    } catch (error) {
        console.error('Lỗi khi xóa tài khoản:', error);
        res.status(500).send({ message: 'Có lỗi xảy ra khi xóa tài khoản.' });
    }
});







// Route lấy danh sách nhiệm vụ
app.get('/tasks', async (req, res) => {
    try {
        const request = new sql.Request();
        const query = 'SELECT ma, ten, moTa FROM NhiemVu';
        const result = await request.query(query);

        res.status(200).json(result.recordset); // Trả về danh sách nhiệm vụ
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhiệm vụ:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách nhiệm vụ.' });
    }
});

// Route thêm nhiệm vụ
app.post('/tasks', async (req, res) => {
    const { ma, ten, moTa } = req.body; // Không bao gồm thuTu

    console.log('Thông tin nhiệm vụ nhận được:', req.body);

    if (!ma || !ten || !moTa) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin nhiệm vụ' });
    }

    try {
        const request = new sql.Request();
        request.input('ma', sql.VarChar, ma.trim());
        request.input('ten', sql.NVarChar, ten.trim());
        request.input('moTa', sql.NVarChar, moTa.trim());

        const query = `INSERT INTO NhiemVu (ma, ten, moTa) VALUES (@ma, @ten, @moTa)`;
        await request.query(query);

        res.status(201).json({ message: 'Nhiệm vụ đã được thêm thành công!' });
    } catch (error) {
        console.error('Lỗi khi thêm nhiệm vụ:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi thêm nhiệm vụ.' });
    }
});


app.get('/api/nhiemvu/progress/:userId', async (req, res) => {
    const userId = req.params.userId; // Lấy userId từ params
    console.log('User ID:', userId); // Log ID người dùng

    try {
        const request = new sql.Request();
        const query = `SELECT * FROM TienTrinhNhiemVu WHERE id = @userId`; // Chỉ tìm theo id
        request.input('userId', sql.VarChar, userId); // Kiểu dữ liệu

        const result = await request.query(query);

        // Log kết quả truy vấn
        console.log('Query Result:', result.recordset);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tiến trình nhiệm vụ cho người dùng này.' });
        }

        res.status(200).json(result.recordset); // Trả về tiến trình nhiệm vụ
    } catch (error) {
        console.error('Lỗi khi lấy tiến trình nhiệm vụ:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy tiến trình nhiệm vụ.' });
    }
});


// Khi người chơi đăng nhập, kiểm tra và khởi tạo tiến trình nhiệm vụ
app.post('/api/nhiemvu/initialize', (req, res) => {
    const userId = req.body.userId;
  
    // Kiểm tra tiến trình trong database
    db.query('SELECT * FROM TienTrinhNhiemVu WHERE userId = ?', [userId], (err, results) => {
      if (err) {
        return res.status(500).send('Lỗi khi kiểm tra tiến trình');
      }
      
      if (results.length === 0) {
        // Nếu chưa có tiến trình, khởi tạo nhiệm vụ đầu tiên
        const initialTask = {
          userId: userId,
          maNhiemVu: 'NV001',  // Khởi nghiệp
          trangThai: 0  // Chưa hoàn thành
        };
        db.query('INSERT INTO TienTrinhNhiemVu SET ?', initialTask, (err, result) => {
          if (err) {
            return res.status(500).send('Lỗi khi khởi tạo tiến trình nhiệm vụ');
          }
          res.status(200).send('Khởi tạo nhiệm vụ thành công');
        });
      } else {
        // Nếu đã có tiến trình
        res.status(200).send(results);
      }
    });
  });


// Xóa nhiệm vụ dựa trên mã nhiệm vụ
app.delete('/nhiemvu/:ma', async (req, res) => {
    const maNhiemVu = req.params.ma; // Lấy mã nhiệm vụ từ tham số URL
    try {
        // Sử dụng câu truy vấn DELETE để xóa nhiệm vụ
        const query = `DELETE FROM NhiemVu WHERE ma = @maNhiemVu`;
        const request = new sql.Request(); // Tạo yêu cầu mới
        request.input('maNhiemVu', sql.VarChar, maNhiemVu); // Thêm tham số vào truy vấn

        const result = await request.query(query);

        // Kiểm tra xem có dòng nào bị xóa hay không
        if (result.rowsAffected[0] > 0) {
            res.status(200).send({ message: 'Xóa nhiệm vụ thành công.' });
        } else {
            res.status(404).send({ message: 'Không tìm thấy nhiệm vụ.' });
        }
    } catch (error) {
        console.error('Lỗi khi xóa nhiệm vụ:', error);
        res.status(500).send({ message: 'Có lỗi xảy ra khi xóa nhiệm vụ.' });
    }
});

// Cập nhật nhiệm vụ dựa trên mã nhiệm vụ
app.put('/nhiemvu/:ma', async (req, res) => {
    const maNhiemVu = req.params.ma; // Lấy mã nhiệm vụ từ tham số URL
    const { ten, moTa } = req.body; // Lấy thông tin cập nhật từ body request
  
    try {
      // Câu truy vấn SQL để cập nhật nhiệm vụ
      const query = `UPDATE NhiemVu SET ten = @ten, moTa = @moTa WHERE ma = @maNhiemVu`;
      const request = new sql.Request();
      request.input('ten', sql.NVarChar, ten);
      request.input('moTa', sql.NVarChar, moTa);
      request.input('maNhiemVu', sql.VarChar, maNhiemVu);
  
      const result = await request.query(query);
  
      // Kiểm tra xem có dòng nào được cập nhật không
      if (result.rowsAffected[0] > 0) {
        res.status(200).send({ message: 'Cập nhật nhiệm vụ thành công.' });
      } else {
        res.status(404).send({ message: 'Không tìm thấy nhiệm vụ.' });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật nhiệm vụ:', error);
      res.status(500).send({ message: 'Có lỗi xảy ra khi cập nhật nhiệm vụ.' });
    }
  });


  app.get('/job-details/:userId', async (req, res) => { 
    const userId = req.params.userId; // Lấy ID người dùng từ tham số
    try { 
        const request = new sql.Request();
        const query = `
            SELECT 
                ctv.id,
                ctv.ma,
                cv.ten,
                ctv.namKinhNghiem
            FROM 
                ChiTietCongViec ctv
            JOIN 
                CongViec cv ON ctv.ma = cv.ma
            WHERE 
                ctv.id = @userId`; 

        request.input('userId', sql.VarChar, userId); // Thay đổi kiểu dữ liệu nếu cần
        const result = await request.query(query); 

        res.status(200).json(result.recordset); // Trả về danh sách chi tiết công việc 
    } catch (error) {
        console.error('Lỗi khi lấy danh sách chi tiết công việc:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách chi tiết công việc.' });
    }
});
