import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IMeet } from 'src/app/models/i-meet';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { SecurityService} from 'src/app/services/security.service';
import { Router, Data, ROUTER_INITIALIZER } from '@angular/router';
import { IUser } from 'src/app/models/i-user.model';
import { StorageService } from 'src/app/services/storage.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAttendance } from 'src/app/models/i-attendance';
import { NgTemplateOutlet } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntlCro } from 'src/app/models/mat-paginator-int-cro';

@Component({
  selector: 'app-meet-admin',
  templateUrl: './meet-admin.component.html',
  styleUrls: ['./meet-admin.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class MeetAdminComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  //meets: IMeet[];
  meets: MatTableDataSource<IMeet>;
  usersAcepted: IAttendance[];
  userList: IUser[];
  subRef$: Subscription;
  displayedColumns: string[] = ['Id','FechaReunion', 'Temperatura', 'Birras', 'invite', 'viewaccepted'];
  displayedTableAceptedColumns: string[] = ['DescripcionIdUsuario', 'status'];
  attendance: IAttendance;
  idReunion: number;
  idUsuario: number;
  fechaNuevaReunion: Date;
  

  constructor(
    private dataService: DataService,
    private securityService: SecurityService,
    private storageService: StorageService,
    private router: Router,
    public modal: NgbModal
  ) { 
    
  }

  ngOnInit() {

    this.subRef$ =  this.dataService.get<IUser>('https://localhost:44329/api/User/'+
    this.storageService.retrieve('userName')).
    subscribe(res => {
      
      this.storageService.store('userLogged',res.body['response']);
      
      if(this.storageService.retrieve('userLogged').rol == 2)
        {
          this.router.navigate(['/pagenotfound']);
        } 

    }, err => { 
      console.log('Error en el login', err);
     });


    this.subRef$ = this.dataService.get<IMeet[]>('https://localhost:44329/api/Meet/bycreator/'+
    this.storageService.retrieve('userLogged').idUsuario)
    .subscribe(res=>{
        //this.meets = res.body['response'];
        this.meets = new MatTableDataSource<IMeet>(res.body['response']);
        this.meets.paginator = this.paginator;
    },
        err => {
          console.log('Error al recuperar las reuniones', err);
        });

  }

  ngOnDestroy()
  {
    if(this.subRef$)
    {
      this.subRef$.unsubscribe();
    }
  }

  invite(e,invitemodal, modalnousersleft)
  {
    this.idReunion = e.id;

    this.subRef$ =  this.dataService.get<IUser[]>('https://localhost:44329/api/User/toinvite/'+
    e.id).
    subscribe(res => {

      this.userList = res.body['response'];
      console.log(res.body['response'][0]);
      if(res.body['response'][0] == undefined)
      {
        this.modal.open(modalnousersleft);
      }
      else
      {
        this.idUsuario = res.body['response'][0].idUsuario;
        this.modal.open(invitemodal);
      }
      
      
    }, err => { 
      console.log('Error en el login', err);
      });

  }

  inviteUser(confirmationInvite) //aca iria la nueva attendance
  {

    const attendance: IAttendance = {
      IdReunion : this.idReunion,
      IdUsuario : Number(this.idUsuario),
    }

    console.log(attendance);

    this.subRef$ =  this.dataService.post<IAttendance>('https://localhost:44329/api/Attendance',
    attendance).
    subscribe(res => {
      this.modal.open(confirmationInvite);
    }, err => { 
      console.log('Error en el login', err);
      });

    this.modal.dismissAll();
  }

  addMeet(addmeetmodal)
  {
    this.fechaNuevaReunion = undefined;
    this.modal.open(addmeetmodal);
  }

  confirmMeet(confirmationMeet, modalincorrectdate) //aca iria la creacion de la reunion
  {
    if(this.fechaNuevaReunion == undefined)
    {
      this.modal.open(modalincorrectdate);modalincorrectdate
    }
    else
    {
      const meet: IMeet = {
        IdUsuarioCreador : this.storageService.retrieve('userLogged').idUsuario,
        FechaReunion : this.fechaNuevaReunion
      };
  
      this.subRef$ = this.dataService.post<IMeet>('https://localhost:44329/api/Meet',meet)
      .subscribe(res=>{
        this.ngOnInit();
        this.modal.open(confirmationMeet);
      },
          err => {
            console.log('Error al recuperar las reuniones', err);
          });
  
      this.modal.dismissAll();
    }
    
  }

  viewAccepted(e, modaltableaccepted) // aca iria la lista de usuarios que aceptaron
  {
    this.subRef$ = this.dataService.get<IAttendance[]>('https://localhost:44329/api/Attendance/acepted/bymeet/'+
    e.id)
      .subscribe(res=>{
          this.usersAcepted = res.body['response'];
          this.modal.open(modaltableaccepted,{size:'lg'});
      },
    err => {
      console.log('Error al recuperar las reuniones', err);
    });
  }


}
