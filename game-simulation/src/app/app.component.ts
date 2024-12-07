import { Component, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "./footer/footer.component";
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from "./admin/admin.component";
import { PLATFORM_ID } from '@angular/core';
import { LoadingComponent } from "./loading/loading.component";
import { TaskIconComponent } from "./task-icon/task-icon.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FooterComponent, FormsModule, AdminComponent, LoadingComponent, TaskIconComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'game-simulation';
  showFooter: boolean = false; // Biến để xác định có hiển thị footer hay không

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Lắng nghe các sự kiện điều hướng
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Chỉ lấy sự kiện NavigationEnd
    ).subscribe((event: NavigationEnd) => {
      console.log('Current URL:', event.url);
      this.showFooter = event.url.includes('/player-profile') || event.url.includes('/personal-info');
    });

  }

}
