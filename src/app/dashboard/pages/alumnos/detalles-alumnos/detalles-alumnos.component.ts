import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnosService } from '../componentes/services/alumnos.service';
import { Alumno } from '../componentes/models/index';
import { MatTableDataSource } from '@angular/material/table';
import { Inscripciones } from '../../inscripciones/componentes/models';
import { InscripcionesService } from '../../inscripciones/componentes/services/inscripciones.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-detalles-alumnos',
  templateUrl: './detalles-alumnos.component.html',
  styleUrls: ['./detalles-alumnos.component.scss'],
})
export class DetallesAlumnosComponent implements OnDestroy {
  alumno: Alumno | undefined;
  private destroyed$ = new Subject();
  dataSource = new MatTableDataSource<Inscripciones>();

  displayedColumns: string[] = [
    'id',
    'curso',
    'fecha_inscripcion',
    'desuscribir',
  ];

  aplicarFiltros(ev: Event): void {
    const inputValue = (ev.target as HTMLInputElement)?.value;
    this.dataSource.filter = inputValue?.trim()?.toLowerCase();
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private inscripcionesService: InscripcionesService,
    private alumnosServices: AlumnosService
  ) {
    this.inscripcionesService
      .obtenerInscripciones()
      .subscribe((inscripciones) => {
        this.dataSource.data = inscripciones.filter(
          (x) =>
            x.alumnoId === parseInt(this.activatedRoute.snapshot.params['id'])
        );
      });
    this.alumnosServices
      .obtenerAlumnoPorId(parseInt(this.activatedRoute.snapshot.params['id']))
      .pipe(takeUntil(this.destroyed$))
      .subscribe((alumno) => (this.alumno = alumno));
  }

  desuscribirAlumno(inscripcionId: number): void {
    if (confirm('Esta seguro de borrar?')) {
      this.inscripcionesService
        .eliminarInscripcion(inscripcionId)
        .subscribe(() => {
          const updatedData = this.dataSource.data.filter(
            (inscripcion) => inscripcion.id !== inscripcionId
          );
          this.dataSource.data = updatedData;
        });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
  }
}
