export interface IAttendance {
    IdAsistencia?: number;
    IdReunion: number;
    IdUsuario: number;
    Aceptada?: string;
    Cumplida?: string;
    IdUsuarioCreador?: number;
    DescripcionUsuarioCreador?: string;
    FechaReunion?: Date;
    Temperatura?: Number;
    DescripcionIdUsuario?: string;
}
