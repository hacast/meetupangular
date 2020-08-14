import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { MeetAdminComponent } from './components/meet/meet-admin.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { MeetCheckoutComponent } from './components/meet-checkout/meet-checkout.component';


const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'meetAdmin', component: MeetAdminComponent},
  {path: 'meetCheckout', component: MeetCheckoutComponent},
  {path: 'modal', component: ModalComponent },
  {path: '**', component: PagenotfoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
  