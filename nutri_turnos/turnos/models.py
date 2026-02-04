from django.db import models

# Create your models here.
class Turno(models.Model):
    paciente = models.CharField(max_length=100)
    fecha = models.DateField()
    hora = models.TimeField()
    motivo = models.TextField()
    estado = models.CharField(max_length=50, default='Pendiente')

    def __str__(self):
        return f'Turno de {self.paciente} el {self.fecha_hora.strftime("%Y-%m-%d %H:%M")}'
    
class Horario(models.Model):
    dia_semana = models.CharField(max_length=20)
    hora_apertura = models.TimeField()
    hora_cierre = models.TimeField()

    def __str__(self):
        return f'Horario: {self.dia_semana} de {self.hora_apertura.strftime("%H:%M")} a {self.hora_cierre.strftime("%H:%M")}'
    
class ConfiguracionTurnos(models.Model):
    duracion_turno = models.IntegerField(help_text='Duración del turno en minutos', default=60)
    tiempo_entre_turnos = models.IntegerField(help_text='Tiempo entre turnos en minutos', default=60)

    def __str__(self):
        return f'Configuración: Duración {self.duracion_turno} min, Tiempo entre turnos {self.tiempo_entre_turnos} min'