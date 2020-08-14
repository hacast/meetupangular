import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ILogin } from 'src/app/models/i-login';
import { IResponse } from 'src/app/models/i-response';
import { IUser } from 'src/app/models/i-user.model';
import { DataService } from 'src/app/services/data.service';
import { SecurityService} from 'src/app/services/security.service';
import { StorageService } from 'src/app/services/storage.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  formLogin: FormGroup;
  subRef$: Subscription;
  subRef$2: Subscription;
  user: IUser;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private securityService: SecurityService, 
    private storageService: StorageService,
    private router: Router,
    public modal: NgbModal
  ) {
      this.securityService.LogOff();
      this.formLogin = formBuilder.group(
        {
          usuario: ['', Validators.required],
          password: ['', Validators.required],
        }
      )
   }

  ngOnInit(): void {
    //console.log(this.storageService.retrieve('usuario'));
  }

  Login(errorModal){
      const userLogin: ILogin = {
        user: this.formLogin.value.usuario,
        password: this.formLogin.value.password,
      };

    this.subRef$ =  this.dataService.post<IResponse>('https://localhost:44329/api/Login',
    userLogin).
    subscribe(res => {
      const token = res.body.response
      //console.log('token', token);
      this.securityService.SetAuthData(token);
      this.storageService.store('userName', userLogin.user)
      //console.log(this.storageService.retrieve('usuario'));
      this.router.navigate(['/home']);
    }, err => { 
      console.log('Error en el login', err);
      this.modal.open(errorModal);
     });
  }

  ngOnDestroy()
  {
    if(this.subRef$)
    {
      this.subRef$.unsubscribe();
    }
  }


}
