import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { SecurityService} from 'src/app/services/security.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { IAttendance } from 'src/app/models/i-attendance';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntlCro } from 'src/app/models/mat-paginator-int-cro';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-meet-checkout',
  templateUrl: './meet-checkout.component.html',
  styleUrls: ['./meet-checkout.component.css'],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class MeetCheckoutComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  //attendances: IAttendance[];
  attendances: MatTableDataSource<IAttendance>;
  attChck: IAttendance[];
  subRef$: Subscription;
  displayedColumns: string[] = ['IdReunion','DescripcionUsuarioCreador', 'FechaReunion', 'Temperatura', 'checkout'];
  displayedTableAceptedColumns: string[] = ['IdReunion','DescripcionUsuarioCreador', 'FechaReunion', 'Temperatura', 'status'];
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

  ngOnInit(): void {

    this.subRef$ = this.dataService.get<IAttendance[]>('https://localhost:44329/api/Attendance/acepted/'+
        this.storageService.retrieve('userLogged').idUsuario)
    .subscribe(res=>{
        
      this.attendances = new MatTableDataSource<IAttendance>(res.body['response']);
      this.attendances.paginator = this.paginator;
        //this.attendances = res.body['response'];
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

  checkout(e, checkmodal)
  {
    this.attendance.IdReunion = e.idReunion;
    this.attendance.IdAsistencia = e.idAsistencia;
    this.attendance.IdUsuario = e.idUsuario;
    this.attendance.Aceptada = e.aceptada;
    this.modal.open(checkmodal);
  }

  confirmCheckOut(modalconfirm)
  {
    this.attendance.Cumplida = 'Si';

    this.subRef$ = this.dataService.put<IAttendance>('https://localhost:44329/api/Attendance',
    this.attendance)
    .subscribe(res=>{
      this.ngOnInit();
      this.modal.open(modalconfirm);
    },
        err => {
          console.log('Error al recuperar las reuniones', err);
        });

    this.modal.dismissAll();
  }

  getcheckOuts(modaltablecheckouts)
  {
    this.subRef$ = this.dataService.get<IAttendance[]>('https://localhost:44329/api/Attendance/checkouts/'+
        this.storageService.retrieve('userLogged').idUsuario)
    .subscribe(res=>{
        this.attChck = res.body['response'];
        this.modal.open(modaltablecheckouts,{size:'lg'});
    },
        err => {
          console.log('Error al recuperar las reuniones', err);
        });
  }

}
