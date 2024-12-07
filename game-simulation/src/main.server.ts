import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { provideHttpClient, withFetch } from '@angular/common/http';

const bootstrap = () => {
  return bootstrapApplication(AppComponent, {
    ...config, // Giữ nguyên cấu hình hiện tại
    providers: [
      provideHttpClient(withFetch()), // Thêm withFetch vào đây
      ...config.providers || [] // Đảm bảo giữ lại các provider khác nếu có
    ]
  });
};

export default bootstrap;
