import { IUser } from 'src/app/models/i-user.model';

export interface IMeet {
    Id?: number;
    IdUsuarioCreador: number;
    FechaReunion: Date;
    Temperatura?: number;
    Birras?: number;
}
