import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component'; 
import { AdminComponent } from './admin/admin.component';
import { PlayerProfileComponent } from "./player-profile/player-profile.component";

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'personal-info', component: PersonalInfoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminComponent},
  { path: 'player-profile', component: PlayerProfileComponent}
];


