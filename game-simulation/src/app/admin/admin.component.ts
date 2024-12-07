import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { UserService } from '../user.service'; // Import UserService
import { BackendUrlService } from '../backend-url.service'; // Import BackendUrlService
import { TaskService } from '../task.service';
import { NhiemVu } from '../nhiem-vu';
import { UserInfo } from '../user-info';
import { LoadingService } from '../loading.service';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isAdmin = false;
  userList: UserInfo[] = [];
  taskList: NhiemVu[] = [];
  searchQuery: string = '';
  selectedTask: NhiemVu | null = null; // Để lưu thông tin nhiệm vụ đang chỉnh sửa
  filteredTaskList: NhiemVu[] = [];
  isEditing: boolean = false;
  showDetails: boolean = false; // Biến để kiểm tra trạng thái xem chi tiết
  showAddTask: boolean = false; // Biến để theo dõi việc hiển thị form thêm nhiệm vụ

  expandedUser: string | null = null;  // Lưu trữ ID người dùng đang mở chi tiết
  selectedUserDetails: any = null; // Để lưu thông tin chi tiết của người dùng

  taskForm: FormGroup = new FormGroup({
    ma: new FormControl(''),
    ten: new FormControl(''),
    moTa: new FormControl('')
  });

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private taskService: TaskService, // Inject TaskService
    private backendUrlService: BackendUrlService, // Inject BackendUrlService
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    // Lấy thông tin người dùng từ UserService
    this.userService.getUserInfo()?.subscribe({
      next: (user) => {
        if (user) {
          this.isAdmin = user.id === 'CuongAFK'; // Kiểm tra xem người dùng có phải là admin không
        }
        this.getUserList(); // Gọi hàm để lấy danh sách người dùng ngay khi khởi tạo
        this.getTaskList();
      },
      error: (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    });
  }


  toggleUserDetails(userId: string) {
    if (this.expandedUser === userId) {
      this.expandedUser = null; // Nếu đã mở, click sẽ đóng lại
    } else {
      this.expandedUser = userId; // Mở thông tin chi tiết người dùng

      // Gọi service để lấy chi tiết người dùng
      this.userService.getUserDetails(userId)?.subscribe({
        next: (userDetails) => {
          this.selectedUserDetails = userDetails;
        },
        error: (err) => {
          console.error('Lỗi khi lấy chi tiết người dùng:', err);
        }
      });
    }
  }


  // Hàm toggle trạng thái form

  toggleAddTaskForm() {
    this.showAddTask = !this.showAddTask; // Bật/tắt trạng thái hiển thị form
    this.taskForm.reset(); // Reset form khi hiển thị lại
  }

  // Lấy danh sách nhiệm vụ
  getTaskList() {
    // Hiển thị modal loading
    this.loadingService.showLoading();
    this.taskService.getTaskList().subscribe({
      next: (tasks) => {
        this.taskList = tasks;
        this.filteredTaskList = tasks;
        console.log('Từ getTaskList Danh sách nhiệm vụ:', this.taskList);
        this.loadingService.hideLoading();
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách nhiệm vụ:', err);
        this.loadingService.hideLoading();
      }
    });
  }

  selectTask(task: any) {
    this.selectedTask = task;
    this.taskForm.patchValue({
      ma: task.ma,
      ten: task.ten,
      moTa: task.moTa
    });
  }


  searchTask() {
    const query = this.searchQuery.toLowerCase();

    // Nếu không có truy vấn tìm kiếm, hiển thị toàn bộ danh sách
    if (!query) {
      this.filteredTaskList = this.taskList; // Đặt lại filteredTaskList thành toàn bộ danh sách
    } else {
      this.filteredTaskList = this.taskList.filter(task =>
        task.ma.toLowerCase().includes(query) ||
        task.ten.toLowerCase().includes(query)
      );
    }
  }

  // Thêm nhiệm vụ mới
  addTask() {
    if (this.taskForm.valid) {
      // Lấy mã nhiệm vụ từ form
      const newTaskId = this.taskForm.value.ma;

      // Kiểm tra nếu mã nhiệm vụ đã tồn tại trong danh sách
      const isDuplicate = this.taskList.some(task => task.ma === newTaskId);

      if (isDuplicate) {
        alert('Mã nhiệm vụ đã tồn tại. Vui lòng nhập mã khác.');
      } else {
        const newTask = {
          ma: newTaskId,
          ten: this.taskForm.value.ten,
          moTa: this.taskForm.value.moTa,
        };
        // Hiển thị modal loading
        this.loadingService.showLoading();
        this.taskService.addTask(newTask).subscribe({
          next: () => {
            this.getTaskList(); // Cập nhật lại danh sách nhiệm vụ
            this.taskForm.reset(); // Reset form
            this.loadingService.hideLoading();
            alert('Thêm nhiệm vụ thành công');
          },
          error: (err) => {
            this.loadingService.hideLoading();
            console.error('Lỗi khi thêm nhiệm vụ:', err);
          }
        });
      }
    } else {
      this.loadingService.hideLoading();
      alert('Vui lòng điền đầy đủ thông tin nhiệm vụ');
    }
  }


  // Hàm để hiển thị form thêm nhiệm vụ
  showAddTaskForm() {
    this.showAddTask = true; // Hiển thị form thêm nhiệm vụ
    this.selectedTask = null; // Đặt lại nhiệm vụ đang chọn
    this.taskForm.reset(); // Reset form
  }

  // Phương thức cập nhật nhiệm vụ
  updateTask(): void {
    if (this.selectedTask && this.taskForm.valid) {
      const updatedTask: any = {
        ma: this.selectedTask.ma, // Giữ nguyên mã nhiệm vụ vì đây là khóa chính
        ten: this.taskForm.get('ten')?.value,
        moTa: this.taskForm.get('moTa')?.value,
      };

      // Hiển thị modal loading
      this.loadingService.showLoading();

      this.taskService.updateTask(updatedTask).subscribe({
        next: (response) => {
          console.log('Cập nhật nhiệm vụ thành công:', response);
          this.getTaskList(); // Cập nhật lại danh sách
          this.taskForm.reset();// Cập nhật danh sách nhiệm vụ sau khi sửa
          this.loadingService.hideLoading();
          alert('Nhiệm vụ đã được cập nhật thành công.');

          this.selectedTask = updatedTask; // Cập nhật selectedTask sau khi sửa

          // Reset lại form sau khi cập nhật thành công
          this.taskForm.reset(updatedTask); // Reset form với dữ liệu mới
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật nhiệm vụ:', error);
          this.loadingService.hideLoading();
          alert('Có lỗi xảy ra khi cập nhật nhiệm vụ. Vui lòng thử lại.');
        }
      });
    } else {
      this.loadingService.hideLoading();
      alert('Form không hợp lệ hoặc không có nhiệm vụ nào được chọn.');
    }
  }

  // Phương thức xóa nhiệm vụ
  deleteTask(taskId: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa nhiệm vụ với mã ${taskId} không?`)) {
      // Hiển thị modal loading
      this.loadingService.showLoading();
      this.taskService.deleteTask(taskId).subscribe({
        next: (response) => {
          console.log('Xóa nhiệm vụ thành công:', response);
          this.getTaskList(); // Cập nhật lại danh sách
          this.taskForm.reset();
          this.loadingService.hideLoading();
          alert(`Nhiệm vụ với mã ${taskId} đã được xóa thành công.`);

        },
        error: (error) => {
          console.error('Lỗi khi xóa nhiệm vụ:', error);
          this.loadingService.hideLoading();
          alert('Có lỗi xảy ra khi xóa nhiệm vụ. Vui lòng thử lại.');
        }
      });
    }
  }



  // Chức năng để bắt đầu chỉnh sửa nhiệm vụ
  editTask(task: any) {
    this.selectedTask = task; // Tham chiếu trực tiếp đến nhiệm vụ
    this.isEditing = true; // Đặt trạng thái chỉnh sửa
  }

  toggleTaskDetails(task: any) {
    if (this.selectedTask && this.selectedTask.ma === task.ma) {
      this.showDetails = !this.showDetails;
    } else {
      this.selectedTask = task;
      this.taskForm.patchValue({
        ma: task.ma,
        ten: task.ten,  // Sử dụng đúng tên trường
        moTa: task.moTa // Sử dụng đúng tên trường
      });
      this.showDetails = true;
    }
  }




  getUserList() {
    // Hiển thị modal loading
    this.loadingService.showLoading();
    const backendUrl = this.backendUrlService.getBackendUrl(); // Sử dụng URL từ BackendUrlService
    this.http.get<any[]>(`${backendUrl}/user-list`).subscribe({
      next: (data) => {
        // Lọc bỏ tài khoản admin khỏi danh sách
        this.userList = data.filter(user => user.id !== 'CuongAFK');
        console.log('Danh sách người dùng:', this.userList);
        this.loadingService.hideLoading();
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách tài khoản:', error);
        this.loadingService.hideLoading();
      }
    });
  }



  searchUser() {
    if (this.searchQuery) {
      const backendUrl = this.backendUrlService.getBackendUrl(); // Sử dụng URL từ BackendUrlService
      this.http.post<any[]>(`${backendUrl}/search-user`, { query: this.searchQuery }).subscribe({
        next: (data) => {
          // Lọc bỏ tài khoản admin khỏi danh sách tìm kiếm
          this.userList = data.filter(user => user.id !== 'CuongAFK');
        },
        error: (error) => {
          console.error('Lỗi khi tìm kiếm người dùng:', error);
        }
      });
    } else {
      this.getUserList(); // Gọi lại danh sách toàn bộ khi không có tìm kiếm
    }
  }

  // Hàm xác nhận hành động với thông báo chi tiết
  confirmAction(action: string, userId: string): boolean {
    return confirm(`Bạn có chắc chắn muốn ${action} tài khoản với ID ${userId} không?`);
  }

  // Phương thức xóa tài khoản
  deleteAccount(userId: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản với ID ${userId} không?`)) {
      // Hiển thị modal loading
      this.loadingService.showLoading();
      this.userService.deleteAccount(userId).subscribe({
        next: (response) => {
          console.log('Xóa tài khoản thành công:', response);
          alert(`Tài khoản với ID ${userId} đã được xóa thành công.`);
          this.getUserList(); // Cập nhật danh sách người dùng sau khi xóa
          this.loadingService.hideLoading();
        },
        error: (error) => {
          console.error('Lỗi khi xóa tài khoản:', error);
          this.loadingService.hideLoading();
          // alert('Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại.');
          this.getUserList(); // Cập nhật danh sách người dùng sau khi xóa
        }
      });
    }
  }

  // Hàm cấm hoặc mở lại tài khoản
  banAccount(userId: string, biCam: boolean) {
    const adminId = 'CuongAFK'; // ID của admin thực hiện cấm/mở lại tài khoản
    const newBanStatus = !biCam; // Đảo ngược trạng thái cấm để xác định hành động (true: cấm, false: mở lại)

    // Hiển thị thông báo xác nhận
    const action = newBanStatus ? 'cấm' : 'mở lại';
    if (this.confirmAction(action, userId)) {
      // Hiển thị modal loading
      this.loadingService.showLoading();
      const backendUrl = this.backendUrlService.getBackendUrl(); // Sử dụng URL từ BackendUrlService
      this.http.post(`${backendUrl}/ban-account`, { id: userId, banned: newBanStatus, adminId }).subscribe({
        next: (response) => {
          console.log(`Tài khoản đã được ${action}:`, response);

          // Cập nhật trực tiếp trong danh sách nếu tồn tại
          const userIndex = this.userList.findIndex(user => user.id === userId);
          if (userIndex !== -1) {
            this.userList[userIndex].biCam = newBanStatus;
          }

          // Nếu đang hiển thị chi tiết người dùng, cập nhật luôn
          if (this.selectedUserDetails?.id === userId) {
            this.selectedUserDetails.biCam = newBanStatus;
          }
          this.loadingService.hideLoading();
          // Thông báo thành công
          alert(`Tài khoản với ID ${userId} đã được ${action} thành công.`);
        },
        error: (error) => {
          console.error('Lỗi khi thực hiện thao tác:', error);
          this.loadingService.hideLoading();
          alert('Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại.');
        }
      });
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


}
