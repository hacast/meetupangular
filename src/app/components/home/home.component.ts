import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IMeet } from 'src/app/models/i-meet';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { SecurityService} from 'src/app/services/security.service';
import { Router } from '@angular/router';
import { IUser } from 'src/app/models/i-user.model';
import { StorageService } from 'src/app/services/storage.service';
import { IAttendance } from 'src/app/models/i-attendance';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlCro } from 'src/app/models/mat-paginator-int-cro';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  meets: IMeet[];
  //attendances: IAttendance[];
  attendances: MatTableDataSource<IAttendance>;
  attAcepted: IAttendance[];
  user: IUser;
  subRef$: Subscription;
  subRef$2: Subscription;
  displayedColumns: string[] = ['IdReunion','DescripcionUsuarioCreador', 'FechaReunion', 'Temperatura', 'acept', 'decline'];
  displayedTableAceptOrDeclColumns: string[] = ['IdReunion','DescripcionUsuarioCreador', 'FechaReunion', 'Temperatura', 'status'];
  attendance: IAttendance = {
    IdUsuario: 0,
    IdReunion:0,
    Aceptada: '',
    Cumplida: '',
    IdAsistencia: 0
  };

  constructor(
    private dataService: DataService,
    private securityService: SecurityService,
    private storageService: StorageService,
    private router: Router,
    public modal: NgbModal
  ) { }

  ngOnInit() {

    
    this.subRef$ =  this.dataService.get<IUser[]>('https://localhost:44329/api/User/'+
    this.storageService.retrieve('userName')).
    subscribe(res => {
      //SI EL USUARIO LOGGUEADO ES CORRECTO BUSCO LAS ASISTENCIAS PENDIENTES
      this.storageService.store('userLogged',res.body['response']);

      this.subRef$ = this.dataService.get<IAttendance[]>('https://localhost:44329/api/Attendance/'+
        this.storageService.retrieve('userLogged').idUsuario)
    .subscribe(res=>{

        this.attendances = new MatTableDataSource<IAttendance>(res.body['response']);
        this.attendances.paginator = this.paginator;     
        //this.attendances = res.body['response'];
    },
        err => {
          console.log('Error al recuperar las reuniones', err);
        });

    }, err => { 
      console.log('Error en el login', err);
     });

        
  }

  ngOnDestroy()
  {
    if(this.subRef$)
    {
      this.subRef$.unsubscribe();
    }
  }

  acept(e, askacept)
  {
    this.attendance.IdReunion = e.idReunion;
    this.attendance.IdAsistencia = e.idAsistencia;
    this.attendance.IdUsuario = e.idUsuario;
    this.modal.open(askacept);
  }

  decline(e, askDecline)
  {
    this.attendance.IdReunion = e.idReunion;
    this.attendance.IdAsistencia = e.idAsistencia;
    this.attendance.IdUsuario = e.idUsuario;
    this.modal.open(askDecline);
  }

  confirmDecision(confirmAcept, decision)
  {
    this.attendance.Aceptada = decision;

    this.subRef$ = this.dataService.put<IAttendance>('https://localhost:44329/api/Attendance',
    this.attendance)
    .subscribe(res=>{
      this.ngOnInit();
      this.modal.open(confirmAcept);
    },
        err => {
          console.log('Error al recuperar las reuniones', err);
        });

    this.modal.dismissAll();
  }

  openLG(contenido){
    this.modal.open(contenido,{size:'lg'});
  }

  getAcepteds(modaltableAcepteds)
  {
    this.subRef$ = this.dataService.get<IAttendance[]>('https://localhost:44329/api/Attendance/acepted/'+
        this.storageService.retrieve('userLogged').idUsuario)
    .subscribe(res=>{
        this.attAcepted = res.body['response'];
        this.modal.open(modaltableAcepteds,{size:'lg'});
    },
        err => {
          console.log('Error al recuperar las reuniones', err);
        });
  }

  getDeclined(modaltableDecl)
  {
    this.subRef$ = this.dataService.get<IAttendance[]>('https://localhost:44329/api/Attendance/declined/'+
        this.storageService.retrieve('userLogged').idUsuario)
    .subscribe(res=>{
        this.attAcepted = res.body['response'];
        this.modal.open(modaltableDecl,{size:'lg'});
    },
        err => {
          console.log('Error al recuperar las reuniones', err);
        });
  }
  

  

}
