import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router'; // Import provideRouter
import { routes } from './app/app.routes'; // Import routes
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http'; // Import withFetch

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), // Thêm withFetch vào provideHttpClient
    provideRouter(routes) // Cung cấp router với các routes đã định nghĩa
  ]
})
.catch((err) => console.error(err));



