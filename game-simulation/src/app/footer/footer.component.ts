import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TaskIconComponent } from "../task-icon/task-icon.component";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TaskIconComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'] // Chỉnh sửa thành styleUrls
})
export class FooterComponent {
  @Input() showFooter: boolean = false;

  // Sử dụng ViewChild để truy cập TaskIconComponent
  @ViewChild(TaskIconComponent) taskIconComponent!: TaskIconComponent;


  constructor(private router: Router) { } // Khai báo Router trong constructor

  gotologin() {
    this.router.navigate(['/login']);
  }

  gotopersonalinfo(){
    this.router.navigate(['/personal-info']);
  }
  gotoplayerprofile() {
    this.router.navigate(['/player-profile']);
  }

  showTaskIcon = false; // Biến trạng thái để kiểm soát ẩn/hiện TaskIconComponent

  // Hàm toggle để mở/đóng giao diện nhiệm vụ
  toggleTaskIcon() {
    this.showTaskIcon = !this.showTaskIcon; // Đảo ngược trạng thái
  }



}
