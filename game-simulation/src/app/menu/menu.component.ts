import { Component } from '@angular/core';
import { Router } from '@angular/router';




@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  constructor(private router: Router) {}

  startGame() {
    console.log('Đang chuyển đến trang login'); // Thêm log để kiểm tra
    this.router.navigate(['/login']);
}

  showInstructions() {
    // Logic để hiển thị hướng dẫn
    console.log('Hiển thị hướng dẫn!');
  }

  goToLeaderboard() {
    this.router.navigate(['/leaderboard']); // Điều hướng đến LeaderboardComponent
  }
}
