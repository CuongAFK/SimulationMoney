import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../user.service';
import { FormsModule } from '@angular/forms';
import { BackendUrlService } from '../backend-url.service';
import { LoadingService } from '../loading.service'; // Import LoadingService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    id: '',
    password: ''
  };

  loginError: string | null = null;
  loginSuccess: string | null = null;
  debugInfo: string | null = null;
  // Biến để theo dõi hiển thị mật khẩu
  isPasswordVisible = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private backendUrlService: BackendUrlService,
    private loadingService: LoadingService // Inject LoadingService
  ) { }

  onLogin() {
    this.loginError = null;
    this.loginSuccess = null;

    const backendUrl = this.backendUrlService.getBackendUrl();
    this.debugInfo = `Backend URL đang sử dụng: ${backendUrl}`;

    this.loadingService.showLoading(); // Hiển thị modal loading

    this.http.post(`${backendUrl}/login`, this.loginData).subscribe({
      next: (response: any) => {
        if (isPlatformBrowser(this.platformId)) {
          this.userService.setUserId(this.loginData.id);
        }

        console.log('Đăng nhập thành công!', response);
        this.loginSuccess = 'Đăng nhập thành công! Đang quay lại trang chính!';

        setTimeout(() => {
          this.loadingService.hideLoading(); // Ẩn modal loading
          this.router.navigate(['/personal-info']);
        }, 2000);
      },
      error: (error) => {
        this.loadingService.hideLoading(); // Ẩn modal loading khi có lỗi
        console.error('Lỗi khi đăng nhập', error);

        if (error.status === 403) {
          this.loginError = 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ admin để được hỗ trợ.';
        } else if (error.status === 401) {
          this.loginError = 'Mật khẩu không chính xác. Vui lòng thử lại.';
        } else if (error.status === 400) {
          this.loginError = 'ID không tồn tại. Vui lòng kiểm tra lại.';
        } else {
          this.loginError = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
        }
      }
    });
  }



  // Hàm để chuyển đổi hiển thị mật khẩu
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  gotoregister() {
    this.router.navigate(['/register']);
  }
}
