import { Component, OnInit } from '@angular/core';
import { TaskService } from '../task.service'; // Import TaskService
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Task {
  ma: string;
  ten: string; 
  moTa: string; 
}

interface Progress {
  ma: string;      // Mã nhiệm vụ
  trangThai: boolean; // true hoặc false
}

@Component({
  selector: 'app-task-icon',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './task-icon.component.html',
  styleUrls: ['./task-icon.component.css']
})
export class TaskIconComponent implements OnInit {
    
  tasks: Task[] = []; // Danh sách nhiệm vụ
  taskProgress: Record<string, boolean> = {}; // Tiến trình nhiệm vụ của người dùng
  currentTask?: Task; // Nhiệm vụ hiện tại

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
    this.loadTaskProgress(); 
  }

  // Lấy danh sách nhiệm vụ từ backend
  loadTasks() {
    this.taskService.getTaskList().subscribe((data: Task[]) => {
      this.tasks = data;
      // console.log('Danh sách nhiệm vụ:', this.tasks);
      this.loadTaskProgress();
    });
  }

  // Lấy tiến trình nhiệm vụ của người dùng
  loadTaskProgress() {
    this.taskService.getTaskProgress().subscribe({
      next: (progress: Progress[]) => {
        // console.log('Dữ liệu tiến trình nhận được:', progress);
        
        if (!Array.isArray(progress)) {
          console.error('Dữ liệu tiến trình không hợp lệ:', progress);
          return;
        }
  
        this.taskProgress = progress.reduce((map: Record<string, boolean>, item: Progress) => {
          if (item.ma && typeof item.trangThai === 'boolean') {
            map[item.ma.trim()] = item.trangThai; // Giữ nguyên giá trị boolean
          } else {
            console.warn('Dữ liệu tiến trình không đúng định dạng:', item);
          }
          return map;
        }, {});
  
        // console.log('Đã thiết lập taskProgress:', this.taskProgress);
        this.updateCurrentTask(); // Cập nhật nhiệm vụ hiện tại sau khi tải tiến trình
      },
      error: (err) => {
        console.error('Lỗi khi tải tiến trình nhiệm vụ:', err);
      }
    });
  }

  updateCurrentTask(task?: Task) {
    // Nếu task không được truyền vào, tức là muốn đóng
    if (task && this.currentTask === task) {
      this.currentTask = undefined;
      return;
    }
    // Nếu task không được truyền vào, tức là muốn mở một nhiệm vụ mới
    this.currentTask = task || this.tasks.find((t) => !this.taskProgress[t.ma.trim()]);
  }
}
