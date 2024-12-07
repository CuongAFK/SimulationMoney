import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user.service';
import { BackendUrlService } from '../backend-url.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../loading.service'; // Import LoadingService
import { UserInfo } from '../user-info';

declare var $: any; // Khai báo jQuery

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {
  playerProfile: UserInfo = {
    id: '',
    ten: '',
    tien: 0,
    tuoi: 0,
    gioiTinh: '',
    ngaySinh: '', 
    tongGiaTriTaiSan: 0,  
    biCam: false          
  };; // Khởi tạo đối tượng chứa thông tin người chơi
  private backendUrl: string = '';
  loading: boolean = false; // Biến điều khiển trạng thái loading

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private backendUrlService: BackendUrlService,
    private loadingService: LoadingService // Inject LoadingService
  ) {}

  ngOnInit(): void {
    this.backendUrl = this.backendUrlService.getBackendUrl();
    
    // Lấy thông tin người dùng từ UserService
    this.userService.getUserInfo()?.subscribe({
      next: (userInfo) => {
        if (userInfo && userInfo.id) {
          this.fetchPlayerProfile(userInfo.id);
        } else {
          console.error('Không tìm thấy thông tin người dùng.');
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    });
  }

  private fetchPlayerProfile(userId: string): void {
    this.loadingService.showLoading(); // Hiển thị modal loading
    this.http.post(`${this.backendUrl}/personal-info`, { id: userId }).subscribe({
      next: (response: any) => {
        if (response) {
          this.playerProfile = response;
          if (this.playerProfile.ngaySinh) {
            const birthDateParts = this.playerProfile.ngaySinh.split('T')[0].split('-');
            this.playerProfile.ngaySinh = `${birthDateParts[2]}/${birthDateParts[1]}/${birthDateParts[0]}`;
          }
          console.log('Thông tin cá nhân:', this.playerProfile);
        }
        this.loadingService.hideLoading(); // Tắt modal loading sau khi có phản hồi
      },
      error: (error) => {
        console.error('Lỗi khi lấy thông tin cá nhân:', error);
        this.loadingService.hideLoading(); // Tắt modal loading nếu có lỗi
      }
    });
  }
}
