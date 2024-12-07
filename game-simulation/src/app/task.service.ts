// File: src/app/task.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BackendUrlService } from './backend-url.service';
import { Observable, tap } from 'rxjs';
import { UserService } from './user.service'; // Import UserService

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private backendUrl: string = 'http://localhost:3000'; // Địa chỉ mặc định cho backend
  private userIdKey: string = 'userId'; // Key cho localStorage

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, // Kiểm tra môi trường chạy (server/browser)
    private http: HttpClient,                        // HttpClient để tương tác với backend
    private backendUrlService: BackendUrlService,    // Inject BackendUrlService để lấy URL động
    private userService: UserService                  // Inject UserService để lấy thông tin người dùng
  ) {
    // Lấy URL từ BackendUrlService
    this.backendUrlService.backendUrl$.subscribe((url) => {
      this.backendUrl = url;
    });
  }

    // Phương thức lấy ID người dùng từ localStorage
    getUserId(): string | null {
      if (isPlatformBrowser(this.platformId)) {
        return localStorage.getItem(this.userIdKey);
      } else {
        console.warn('localStorage is not available on the server side');
        return null;
      }
    }

  // Lấy danh sách nhiệm vụ
  getTaskList(): Observable<any> {
    return this.http.get(`${this.backendUrl}/tasks`).pipe(
        tap(data => console.log('Dữ liệu nhiệm vụ:', data)) // Thêm dòng này
    );
}


getTaskProgress(): Observable<any> {
  const userInfo$ = this.userService.getUserInfo(); // Lấy Observable từ UserService

  if (userInfo$) {
    return new Observable((observer) => {
      userInfo$.subscribe({
        next: (userInfo) => {
          if (userInfo && userInfo.id) {
            const userId = userInfo.id;
            // console.log('User ID:', userId);
            // Gọi API lấy tiến trình nhiệm vụ từ userId
            this.http.get(`${this.backendUrl}/api/nhiemvu/progress/${userId}`).subscribe({
              next: (taskProgress) => {
                observer.next(taskProgress);
                observer.complete();
              },
              error: (err) => {
                observer.error(err);
              }
            });
          } else {
            observer.error('User ID not found');
          }
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  } else {
    return new Observable((observer) => {
      observer.error('User not logged in');
      observer.complete();
    });
  }
}

  // Hàm để khởi tạo tiến trình nhiệm vụ cho người dùng mới  // Khởi tạo tiến trình nhiệm vụ cho người dùng
  initializeTaskProgress(tasks: { ma: string }[]): Observable<any> {
    const userId = this.getUserId(); // Lấy ID người dùng từ localStorage
  
    if (userId) {
      const payload = {
        userId: userId,
        tasks: tasks // Gửi danh sách mã nhiệm vụ
      };
  
      return this.http.post(`${this.backendUrl}/api/nhiemvu/initialize`, payload);
    } else {
      console.error('Không tìm thấy ID người dùng');
      return new Observable((observer) => {
        observer.error('Không tìm thấy ID người dùng');
        observer.complete();
      });
    }
  }





  addTask(task: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/tasks`, task); // Sử dụng POST để thêm nhiệm vụ
}

// Gửi yêu cầu cập nhật nhiệm vụ đến backend
updateTask(task: any): Observable<any> {
  return this.http.put(`${this.backendUrl}/nhiemvu/${task.ma}`, task);
}

  // Hàm xóa nhiệm vụ
  deleteTask(ma: string): Observable<any> {
    const url = `${this.backendUrl}/nhiemvu/${ma}`;
    return this.http.delete(url);
  }

}
