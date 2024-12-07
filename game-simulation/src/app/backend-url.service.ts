import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendUrlService {
  private backendUrl = new BehaviorSubject<string>('http://localhost:3000'); // Đặt URL mặc định
  backendUrl$ = this.backendUrl.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUrl(); // Gọi hàm khởi tạo URL khi service được khởi động
  }

  // Lấy URL backend hiện tại
  getBackendUrl(): string {
    return this.backendUrl.value;
  }

  // Cập nhật URL backend mới
  setBackendUrl(newUrl: string): void {
    this.backendUrl.next(newUrl);
    console.log('Đã cập nhật Backend URL:', newUrl);
  }

  // Hàm đọc URL từ file và cập nhật vào service
  private async initializeUrl(): Promise<void> {
    try {
      // Đọc file từ thư mục public
      const response: any = await this.http.get('/serveo-url.json').toPromise(); 
      if (response && response.backendUrl) {
        this.setBackendUrl(response.backendUrl);
        console.log(`Backend URL được cập nhật từ file: ${response.backendUrl}`);
      }
    } catch (error) {
      console.error('Không thể đọc URL từ file serveo-url.json:', error);
    }
  }
}
