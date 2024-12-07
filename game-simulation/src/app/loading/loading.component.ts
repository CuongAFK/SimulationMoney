import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent implements OnInit {
  loading$: Observable<boolean>; // Observable để lắng nghe trạng thái loading

  constructor(public loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$; // Lấy giá trị trạng thái từ LoadingService
  }

  ngOnInit(): void {
    this.loading$.subscribe((value) => {
      // console.log('Trạng thái loading hiện tại:', value); // Kiểm tra trạng thái khi thay đổi
    });
  }
}
