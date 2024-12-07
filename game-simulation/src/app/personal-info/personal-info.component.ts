import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { AdminComponent } from "../admin/admin.component";
import { BackendUrlService } from '../backend-url.service';
import { LoadingService } from "../loading.service";
import { UserInfo } from '../user-info';
import { JobDetail } from '../job-detail';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [FormsModule, CommonModule, AdminComponent],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
  userInfo: UserInfo = {
    id: '',
    ten: '',
    tien: 0,
    tuoi: 0,
    gioiTinh: '',
    ngaySinh: '', 
    tongGiaTriTaiSan: 0, 
    biCam: false         
  };

  jobDetails: JobDetail[] = []; // Biến để chứa thông tin công việc

  isEditMode = false;
  isAdmin = false;

  backendUrl: string = ''; // URL động cho backend

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private userService: UserService,
    private backendUrlService: BackendUrlService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadingService.showLoading(); // Hiển thị loading khi bắt đầu tải dữ liệu

    // Lấy URL động từ BackendUrlService
    this.backendUrlService.backendUrl$.subscribe((url) => {
      this.backendUrl = url;
      this.loadUserInfo(); // Gọi hàm load thông tin khi có URL backend
      
    });
  }

  // Tải thông tin người dùng từ UserService
 loadUserInfo() {
  const userInfo$ = this.userService.getUserInfo();
  
  if (userInfo$) {
    userInfo$.subscribe({
      next: (data) => {
        if (data) { // Kiểm tra nếu dữ liệu tồn tại
          this.userInfo = data;
          this.isAdmin = this.userInfo.id === 'CuongAFK'; // Kiểm tra admin
          this.userInfo.tuoi = this.calculateAge(this.userInfo.ngaySinh);
          console.log('Thông tin người dùng đã tải:', this.userInfo);
          this.loadJobDetails();
          
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin người dùng:', error);
      },
      complete: () => {
        this.loadingService.hideLoading(); // Tắt modal loading sau khi tải thành công
      }
    });
  } else {
    console.error('Không tìm thấy thông tin người dùng.');
    this.loadingService.hideLoading(); // Tắt modal loading khi không có user
  }
}

formatDate(dateString: string): string {
  if (!dateString) return '';

  // Tạo đối tượng Date từ chuỗi ISO
  const date = new Date(dateString);

  // Lấy ngày, tháng và năm
  const day = date.getDate().toString().padStart(2, '0');   // Lấy ngày với padding '0' nếu cần
  const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Tháng cần cộng thêm 1 vì getMonth() trả về giá trị từ 0-11
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

  // Lưu thông tin người dùng
  saveUserInfo() {
    this.loadingService.showLoading(); // Hiển thị loading khi bắt đầu lưu

    const updatedUserData = {
      id: this.userInfo.id,
      ten: this.userInfo.ten,
      tien: this.userInfo.tien,
      ngaySinh: this.userInfo.ngaySinh,
      gioiTinh: this.userInfo.gioiTinh,
      tuoi: this.calculateAge(this.userInfo.ngaySinh) // Tính tuổi từ ngày sinh
    };

    console.log('Dữ liệu gửi đến backend:', updatedUserData);

    // Gọi API lưu thông tin qua UserService
    this.userService.saveUserInfo(updatedUserData).subscribe({
      next: (response) => {
        console.log('Lưu thông tin thành công:', response);
        this.isEditMode = false; // Thoát chế độ chỉnh sửa sau khi lưu thành công
        this.loadUserInfo(); // Tải lại thông tin mới
      },
      error: (error) => {
        console.error('Lỗi khi lưu thông tin:', error);
      },
      complete: () => {
        this.loadingService.hideLoading(); // Tắt modal loading sau khi yêu cầu hoàn thành
      }
    });
  }

  // Tính tuổi từ ngày sinh
  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Đăng xuất và xóa thông tin người dùng
  logout() {
    const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất không?');
    if (confirmed) {
      this.userService.clearUserId(); // Xóa thông tin người dùng khỏi UserService
      this.router.navigate(['/login']); // Chuyển hướng về trang đăng nhập
    }
  }


loadJobDetails() {
  const userId = this.userInfo.id; // Lấy ID người dùng từ thông tin người dùng
  console.log('ID người dùng:', userId); // Log ID người dùng
  const jobDetails$ = this.userService.getJobDetails(userId);

  if (jobDetails$) {
    jobDetails$.subscribe({
      next: (data) => {
        console.log('Dữ liệu công việc nhận được:', data);
        if (data) {
          this.jobDetails = data; // Gán dữ liệu công việc vào biến jobDetails
        } else {
          console.error('Không có dữ liệu công việc');
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin công việc:', error);
      },
      complete: () => {
        this.loadingService.hideLoading();
      }
    });
  } else {
    console.error('Không tìm thấy thông tin công việc.');
    this.loadingService.hideLoading();
  }
}


  
}
