-- Tạo mới cơ sở dữ liệu
CREATE DATABASE MoneySimulatorDB;
GO

USE MoneySimulatorDB;
GO

-- 1. Bảng NguoiDung: Lưu thông tin tài khoản người dùng
CREATE TABLE NguoiDung (
    id VARCHAR(20) PRIMARY KEY,   -- ID người dùng
    matkhau NVARCHAR(255) NOT NULL -- Mật khẩu mã hóa
);

-- 2. Bảng ThongTin: Lưu thông tin cá nhân người dùng
CREATE TABLE ThongTin (
    id VARCHAR(20) PRIMARY KEY,   -- ID người dùng (khóa ngoại)
    ten NVARCHAR(100),            -- Tên người dùng
    tuoi INT,                     -- Tuổi
    gioiTinh NVARCHAR(10),        -- Giới tính
    ngaySinh DATE,                -- Ngày sinh
    tien INT,                     -- Số tiền hiện tại
    tongGiaTriTaiSan INT,         -- Tổng giá trị tài sản
    biCam BIT DEFAULT 0,          -- Trạng thái bị cấm (0: Không, 1: Bị cấm)
    CONSTRAINT FK_ThongTin_NguoiDung FOREIGN KEY (id) REFERENCES NguoiDung(id) ON DELETE CASCADE
);

-- 3. Bảng TaiSan: Lưu thông tin tài sản
CREATE TABLE TaiSan (
    ma VARCHAR(10) PRIMARY KEY,   -- Mã tài sản
    ten NVARCHAR(100),            -- Tên tài sản
    giaTri DECIMAL(18, 2)         -- Giá trị của tài sản
);

-- 4. Bảng ChiTietTaiSan: Lưu chi tiết các tài sản người dùng sở hữu
CREATE TABLE ChiTietTaiSan (
    id VARCHAR(20),               -- ID người dùng
    ma VARCHAR(10),               -- Mã tài sản
    soLuong INT,                  -- Số lượng tài sản
    PRIMARY KEY (id, ma),
    CONSTRAINT FK_ChiTietTaiSan_ThongTin FOREIGN KEY (id) REFERENCES ThongTin(id) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietTaiSan_TaiSan FOREIGN KEY (ma) REFERENCES TaiSan(ma) ON DELETE CASCADE
);

-- 5. Bảng BangCap: Lưu thông tin về các bằng cấp
CREATE TABLE BangCap (
    ma VARCHAR(10) PRIMARY KEY,   -- Mã bằng cấp
    ten NVARCHAR(100),            -- Tên bằng cấp
    giaTri INT                    -- Giá trị bằng cấp (hệ số)
);

-- 6. Bảng ChiTietBangCap: Lưu bằng cấp mà người dùng sở hữu
CREATE TABLE ChiTietBangCap (
    id VARCHAR(20),               -- ID người dùng
    ma VARCHAR(10),               -- Mã bằng cấp
    PRIMARY KEY (id, ma),
    CONSTRAINT FK_ChiTietBangCap_ThongTin FOREIGN KEY (id) REFERENCES ThongTin(id) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietBangCap_BangCap FOREIGN KEY (ma) REFERENCES BangCap(ma) ON DELETE CASCADE
);

-- 7. Bảng CongViec: Lưu thông tin công việc
CREATE TABLE CongViec (
    ma VARCHAR(10) PRIMARY KEY,   -- Mã công việc
    ten NVARCHAR(100),             -- Tên công việc
	chuyenNganh NVARCHAR(50)
);



select*
from CongViec

-- 8. Bảng ChiTietCongViec: Lưu công việc hiện tại của người dùng
CREATE TABLE ChiTietCongViec (
    id VARCHAR(20),               -- ID người dùng
    ma VARCHAR(10),               -- Mã công việc
    namKinhNghiem INT,            -- Số năm kinh nghiệm
    PRIMARY KEY (id, ma),
    CONSTRAINT FK_ChiTietCongViec_ThongTin FOREIGN KEY (id) REFERENCES ThongTin(id) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietCongViec_CongViec FOREIGN KEY (ma) REFERENCES CongViec(ma) ON DELETE CASCADE
);

-- 9. Bảng MoiQuanHe: Lưu các loại mối quan hệ
CREATE TABLE MoiQuanHe (
    ma VARCHAR(10) PRIMARY KEY,   -- Mã mối quan hệ
    ten NVARCHAR(100)             -- Tên mối quan hệ
);

-- 10. Bảng ChiTietMoiQuanHe: Lưu chi tiết mối quan hệ của người dùng
CREATE TABLE ChiTietMoiQuanHe (
    id VARCHAR(20),               -- ID người dùng
    ma VARCHAR(10),               -- Mã mối quan hệ
    PRIMARY KEY (id, ma),
    CONSTRAINT FK_ChiTietMoiQuanHe_ThongTin FOREIGN KEY (id) REFERENCES ThongTin(id) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietMoiQuanHe_MoiQuanHe FOREIGN KEY (ma) REFERENCES MoiQuanHe(ma) ON DELETE CASCADE
);

-- 11. Bảng NhiemVu: Lưu thông tin các nhiệm vụ
CREATE TABLE NhiemVu (
    ma VARCHAR(10) PRIMARY KEY,   -- Mã nhiệm vụ
    ten NVARCHAR(100),            -- Tên nhiệm vụ
    moTa NVARCHAR(500) NULL       -- Mô tả nhiệm vụ
);

-- 12. Bảng TienTrinhNhiemVu: Theo dõi tiến trình nhiệm vụ của người chơi
CREATE TABLE TienTrinhNhiemVu (
    id VARCHAR(20),               -- ID người dùng
    ma VARCHAR(10),               -- Mã nhiệm vụ
    trangThai BIT DEFAULT 0,      -- Trạng thái nhiệm vụ (0: Chưa hoàn thành, 1: Hoàn thành)
    PRIMARY KEY (id, ma),
    CONSTRAINT FK_TienTrinhNhiemVu_ThongTin FOREIGN KEY (id) REFERENCES ThongTin(id) ON DELETE CASCADE,
    CONSTRAINT FK_TienTrinhNhiemVu_NhiemVu FOREIGN KEY (ma) REFERENCES NhiemVu(ma) ON DELETE CASCADE
);

CREATE TABLE NganHang (
    maNganHang VARCHAR(10) PRIMARY KEY,   -- Mã ngân hàng (khóa chính)
    tenNganHang NVARCHAR(100),            -- Tên ngân hàng
    id VARCHAR(20),                       -- ID người dùng thành lập ngân hàng
    soTienHienCo INT,                     -- Số tiền ngân hàng hiện có
    laiSuat FLOAT,                        -- Lãi suất áp dụng cho các khoản vay
    dieuKienVay NVARCHAR(500),            -- Mô tả điều kiện vay (nếu cần)
	moTa NVARCHAR(500),
    FOREIGN KEY (id) REFERENCES ThongTin(id) ON DELETE CASCADE
);



CREATE TABLE KhoanVayChiTiet (
    id VARCHAR(20),                        -- ID người vay (liên kết với ThongTin)
    maNganHang VARCHAR(10),                -- Mã ngân hàng (khóa ngoại)
    soTienVay INT,                         -- Số tiền vay
    laiSuat FLOAT,                         -- Lãi suất tại thời điểm vay
    ngayVay DATE,                          -- Ngày vay tiền
    ngayDaoHan DATE,                       -- Ngày đáo hạn
    soTienConNo INT,                       -- Số tiền còn nợ (bao gồm cả lãi)
    trangThai BIT,                         -- Trạng thái vay (0: Đang vay, 1: Đã trả hết)
    FOREIGN KEY (id) REFERENCES ThongTin(id),  -- Khóa ngoại tới bảng ThongTin
    FOREIGN KEY (maNganHang) REFERENCES NganHang(maNganHang)   -- Khóa ngoại tới bảng NganHang
);

DROP TABLE KhoanVayChiTiet;
DROP TABLE NganHang;

DROP TRIGGER trg_DeleteChiTietCongViec

select * from ChiTietCongViec

INSERT INTO NguoiDung (id, matkhau)
VALUES ('user001', 'password123');
INSERT INTO NguoiDung (id, matkhau)
VALUES ('user002', 'password123');
INSERT INTO NguoiDung (id, matkhau)
VALUES ('user003', 'password123');
INSERT INTO NguoiDung (id, matkhau)
VALUES ('user004', 'password123');

DELETE FROM NguoiDung WHERE id = 'user001';

CREATE TRIGGER trg_DeleteKhoanVay
ON ThongTin
AFTER DELETE
AS
BEGIN
    DELETE FROM KhoanVayChiTiet
    WHERE id IN (SELECT id FROM deleted);
END;


CREATE TRIGGER trg_DeleteKhoanVayNganHang
ON NganHang
AFTER DELETE
AS
BEGIN
    DELETE FROM KhoanVayChiTiet
    WHERE maNganHang IN (SELECT maNganHang FROM deleted);
END;

CREATE TRIGGER trg_DeleteChiTietCongViec
ON ChiTietCongViec
AFTER UPDATE
AS
BEGIN
    DELETE FROM ChiTietCongViec
    WHERE id IN (SELECT id FROM inserted) AND ma = 'CV001' AND 
          id IN (SELECT id FROM ChiTietCongViec WHERE ma <> 'CV001');
END;

CREATE TRIGGER trg_UpdateChiTietCongViec
ON ChiTietCongViec
AFTER DELETE
AS
BEGIN
    -- Gán công việc 'Thất nghiệp' cho người dùng nếu họ không có công việc nào khác
    INSERT INTO ChiTietCongViec (id, ma, namKinhNghiem)
    SELECT deleted.id, 'CV001', T.tuoi
    FROM deleted
    JOIN ThongTin T ON deleted.id = T.id
    WHERE deleted.id NOT IN (SELECT id FROM ChiTietCongViec WHERE ma <> 'CV001');
END;

CREATE TRIGGER trg_InsertChiTietCongViec
ON ThongTin
AFTER INSERT
AS
BEGIN
    INSERT INTO ChiTietCongViec (id, ma, namKinhNghiem)
    SELECT id, 'CV001', tuoi
    FROM inserted;
END;

CREATE TRIGGER trg_InsertChiTietCongViec
ON ThongTin
AFTER INSERT
AS
BEGIN
    -- Thêm công việc 'Thất nghiệp' nếu người dùng không có công việc nào
    INSERT INTO ChiTietCongViec (id, ma, namKinhNghiem)
    SELECT id, 'CV001', tuoi
    FROM inserted
    WHERE id NOT IN (SELECT id FROM ChiTietCongViec);
END;

CREATE TRIGGER trg_UpdateNamKinhNghiem
ON ThongTin
AFTER UPDATE
AS
BEGIN
    UPDATE ChiTietCongViec
    SET namKinhNghiem = i.tuoi
    FROM ChiTietCongViec c
    JOIN inserted i ON c.id = i.id
    WHERE c.ma = 'CV001';  -- Chỉ cập nhật nếu công việc là 'Thất nghiệp'
END;


CREATE TRIGGER trg_AddProgressOnUserInsert
ON ThongTin
AFTER INSERT
AS
BEGIN
    DECLARE @userId VARCHAR(20);

    -- Lấy ID của người dùng vừa được thêm
    SELECT @userId = id FROM inserted;

    -- Thêm tiến trình nhiệm vụ cho người dùng mới
    INSERT INTO TienTrinhNhiemVu (id, ma, trangThai)
    SELECT @userId, ma, 0 -- 0 là trạng thái chưa hoàn thành
    FROM NhiemVu; -- Lấy tất cả mã nhiệm vụ từ bảng NhiemVu
END;

CREATE TRIGGER trg_AddProgressOnTaskInsert
ON NhiemVu
AFTER INSERT
AS
BEGIN
    DECLARE @taskId VARCHAR(10);

    -- Lấy mã nhiệm vụ vừa được thêm
    SELECT @taskId = ma FROM inserted;

    -- Cập nhật tiến trình nhiệm vụ cho tất cả người dùng
    INSERT INTO TienTrinhNhiemVu (id, ma, trangThai)
    SELECT id, @taskId, 0 -- 0 là trạng thái chưa hoàn thành
    FROM ThongTin; -- Lấy tất cả ID người dùng từ bảng ThongTin
END;

CREATE TRIGGER trg_DeleteProgressOnUserDelete
ON ThongTin
AFTER DELETE
AS
BEGIN
    DECLARE @userId VARCHAR(20);

    -- Lấy ID của người dùng bị xóa
    SELECT @userId = id FROM deleted;

    -- Xóa tiến trình nhiệm vụ của người dùng bị xóa
    DELETE FROM TienTrinhNhiemVu WHERE id = @userId;
END;

SELECT * FROM sys.triggers WHERE parent_id = OBJECT_ID('NguoiDung');


CREATE TRIGGER trg_DeleteProgressOnTaskDelete
ON NhiemVu
AFTER DELETE
AS
BEGIN
    DECLARE @taskId VARCHAR(10);

    -- Lấy mã nhiệm vụ bị xóa
    SELECT @taskId = ma FROM deleted;

    -- Xóa tất cả tiến trình nhiệm vụ liên quan đến nhiệm vụ bị xóa
    DELETE FROM TienTrinhNhiemVu WHERE ma = @taskId;
END;

CREATE TRIGGER trg_UpdateProgressOnTaskUpdate
ON NhiemVu
AFTER UPDATE
AS
BEGIN
    DECLARE @taskId VARCHAR(10);

    -- Lấy mã nhiệm vụ vừa được cập nhật
    SELECT @taskId = ma FROM inserted;

    -- Nếu cần, bạn có thể cập nhật trạng thái hoặc thông tin liên quan trong bảng TienTrinhNhiemVu
    UPDATE TienTrinhNhiemVu 
    SET trangThai = 0 -- hoặc bất kỳ giá trị nào bạn muốn cập nhật
    WHERE ma = @taskId;
END;


CREATE TRIGGER UpdateThongTin
ON NguoiDung
AFTER INSERT
AS
BEGIN
    INSERT INTO ThongTin (id, ten, tien, tongGiaTriTaiSan)
    SELECT id, '', 0, 0 FROM inserted;
END;

select *
from NguoiDung

DELETE FROM NguoiDung;
delete from ThongTin;


select *
from ThongTin

SELECT *
FROM NhiemVu;

select *
from TienTrinhNhiemVu;

select * 
from NganHang

SELECT *
FROM ChiTietCongViec;




INSERT INTO NhiemVu (ma, ten, moTa)
VALUES ('NV001', N'Khởi Nghiệp', N'Tìm đến mục ngân hàng và vay một số tiền để bắt đầu sự nghiệp.');

DELETE FROM NguoiDung WHERE id = 'user2';


	INSERT INTO NganHang (maNganHang, tenNganHang, id, soTienHienCo, laiSuat, dieuKienVay, moTa) 
	VALUES ('NH001', N'Ngân hàng AdminBank', 'CuongAFK', 10000000, 5.0, N'Đang thất nghiệp', 
	N'Thất nghiệp bơi hết vào đây! Cho vay tối đa 10.000 đô la với lãi suất chỉ 5%! chỉ có tại Ngân hàng AdminBank.');



INSERT INTO CongViec (ma, ten)
VALUES ('CV001', N'Thất nghiệp');

INSERT INTO ChiTietCongViec (id, ma, namKinhNghiem)
SELECT id, 'CV001', tuoi
FROM ThongTin;

INSERT INTO CongViec (ma, ten, chuyenNganh) VALUES ('CV002', N'Thực tập sinh ngân hàng', N'Ngân hàng');
INSERT INTO CongViec (ma, ten, chuyenNganh) VALUES ('CV003', N'Nhân viên giao dịch', N'Ngân hàng');
INSERT INTO CongViec (ma, ten, chuyenNganh) VALUES ('CV004', N'Chuyên viên tư vấn tài chính', N'Tài chính');
INSERT INTO CongViec (ma, ten, chuyenNganh) VALUES ('CV005', N'Trưởng phòng giao dịch', N'Ngân hàng');
INSERT INTO CongViec (ma, ten, chuyenNganh) VALUES ('CV006', N'Phó giám đốc ngân hàng', N'Ngân hàng');
INSERT INTO CongViec (ma, ten, chuyenNganh) VALUES ('CV007', N'Giám đốc ngân hàng', N'Ngân hàng');
