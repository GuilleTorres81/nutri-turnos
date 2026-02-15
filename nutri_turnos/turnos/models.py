from datetime import datetime
from django.db import models

# Create your models here.
class Turno(models.Model):
    nombre = models.CharField(max_length=100, default=None)
    apellido = models.CharField(max_length=100, default=None)
    email = models.EmailField(max_length=100, default=None)
    fecha = models.DateField()
    hora = models.TimeField()
    fecha_hora = models.DateTimeField(default=None)
    encuentro = models.CharField(max_length=100, default=None)
    motivo = models.CharField(max_length=100)
    estado = models.CharField(max_length=50, default='Pendiente')

    def __str__(self):
        return f'Turno: {self.nombre} {self.apellido} - {self.encuentro} el {self.fecha} a las {self.hora}'
    
    def save(self, *args, **kwargs):
        # Combinar fecha y hora en fecha_hora antes de guardar
        self.fecha_hora = datetime.combine(self.fecha, self.hora)
        super().save(*args, **kwargs)
        
    def to_json(self):
        return {
            'id': self.id,
            'fecha_hora': self.fecha_hora.strftime('%d/%m/%Y %H:%M'),
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email,
            'motivo': self.motivo,
            'encuentro': self.encuentro,
        }
    
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