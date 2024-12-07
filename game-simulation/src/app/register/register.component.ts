import { CommonModule, isPlatformBrowser } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service'; 
import { BackendUrlService } from '../backend-url.service';
import { LoadingService } from '../loading.service'; // Import LoadingService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
    id: '',
    password: '',
    confirmPassword: '' 
  };

  showPassword = false;
  showConfirmPassword = false;
  registrationSuccess = false; 
  registrationError: string | null = null; 

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService, 
    private backendUrlService: BackendUrlService, 
    private loadingService: LoadingService // Inject LoadingService
  ) { }

  onRegister() {
    this.registrationSuccess = false; 
    this.registrationError = null; 

    if (this.registerData.password.length < 8) {
      this.registrationError = 'Mật khẩu phải có ít nhất 8 ký tự.';
      return; 
    }

   // Kiểm tra khớp mật khẩu
   if (this.registerData.password !== this.registerData.confirmPassword) {
    this.registrationError = 'Mật khẩu không khớp!';
    return;
  }

    // Kiểm tra xem mật khẩu có ít nhất một ký tự chữ cái không
    const hasLetter = /[a-zA-Z]/.test(this.registerData.password);
    if (!hasLetter) {
      this.registrationError = 'Mật khẩu phải chứa ít nhất 1 ký tự chữ cái.';
      return; 
    }

    if (isPlatformBrowser(this.platformId)) {
      const backendUrl = this.backendUrlService.getBackendUrl(); // Sử dụng URL từ BackendUrlService
      
      // Hiển thị modal loading
      this.loadingService.showLoading(); 
      // Tắt modal loading khi điều hướng
      // this.loadingService.hideLoading(); 

      this.http.post(`${backendUrl}/register`, this.registerData).subscribe(
        response => {
          console.log('Đăng ký thành công!', response);
          this.registrationSuccess = true; 

          // Lưu ID người dùng vào UserService nếu cần thiết
          this.userService.setUserId(this.registerData.id);

          setTimeout(() => {
            this.router.navigate(['/login']);
            this.loadingService.hideLoading(); // Tắt modal loading khi điều hướng
          }, 2000);
        },
        error => {
          console.error('Lỗi khi đăng ký', error);
          this.registrationError = 'ID đã tồn tại hoặc có lỗi xảy ra. Vui lòng thử lại.';
          this.loadingService.hideLoading(); // Tắt modal loading nếu có lỗi
        }
      );
    } else {
      console.error('localStorage không khả dụng trong môi trường này.');
    }
  }

  gotologin() {
    this.router.navigate(['/login']);
  }
}
