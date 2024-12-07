import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BackendUrlService } from './backend-url.service'; // Import BackendUrlService
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userIdKey = 'userId';
  private backendUrl: string = 'http://localhost:3000'; // Địa chỉ backend

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient, // Inject HttpClient để gửi yêu cầu HTTP
    private router: Router, // Inject Router để điều hướng khi đăng xuất
    private backendUrlService: BackendUrlService // Inject BackendUrlService
  ) {
    // Lấy URL từ BackendUrlService
    this.backendUrlService.backendUrl$.subscribe((url) => {
      this.backendUrl = url;
    });
  }


  // Lưu ID người dùng vào localStorage
  setUserId(userId: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userIdKey, userId);
    } else {
      console.warn('localStorage is not available on the server side');
    }
  }
 // Lấy ID người dùng từ localStorage
 getUserId(): string | null {
  if (isPlatformBrowser(this.platformId)) {
    return localStorage.getItem(this.userIdKey);
  } else {
    console.warn('localStorage is not available on the server side');
    return null;
  }
}

  // Hàm để lấy thông tin người dùng từ API hoặc localStorage
  getUserInfo(): Observable<any> | null {
    const userId = this.getUserId(); // Lấy userId từ localStorage
    
    if (userId) {
      const apiUrl = `${this.backendUrl}/user/${userId}`; // Sử dụng URL động
      return this.http.get(apiUrl); // Gọi API và trả về Observable
    } else {
      console.error('Không tìm thấy ID người dùng trong localStorage');
      return null; // Trường hợp không tìm thấy userId
    }
  }

  getUserDetails(userId: string): Observable<any> | null {
    if (userId) {
      const apiUrl = `${this.backendUrl}/user/${userId}`; // Sử dụng URL động từ backend
      return this.http.get(apiUrl); // Gọi API và trả về Observable
    } else {
      console.error('Không tìm thấy ID người dùng');
      return null;
    }
  }

  saveUserInfo(userData: any) {
    // Gọi API để lưu thông tin người dùng
    return this.http.post(`${this.backendUrl}/save-personal-info`, userData);
  }

    // Phương thức xóa tài khoản
    deleteAccount(userId: string): Observable<any> {
      const apiUrl = `${this.backendUrl}/user/${userId}`; // Endpoint xóa người dùng
  
      return this.http.delete(apiUrl); // Gọi API xóa người dùng
    }

  // Kiểm tra tài khoản có bị cấm không
  private checkIfBanned(userId: string) {
    this.http.get(`${this.backendUrl}/user/${userId}`).subscribe({
      next: (response: any) => {
        if (response.biCam) {
          this.clearUserId();
          alert('Tài khoản của bạn đã bị cấm. Vui lòng liên hệ admin.');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    });
  }

  // Xóa ID người dùng khỏi localStorage
  clearUserId() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.userIdKey);
    }
  }

    // Hàm lấy thông tin chi tiết công việc cho người dùng
    getJobDetails(userId: string): Observable<any[]> | null {
      if (userId) {
          const apiUrl = `${this.backendUrl}/job-details/${userId}`; // Sử dụng URL động từ backend
          return this.http.get<any[]>(apiUrl); // Gọi API và trả về Observable
      } else {
          console.error('Không tìm thấy ID người dùng');
          return null;
      }
  }



}
