from datetime import datetime
from django.utils import timezone
from django.utils.timezone import localtime

from django.db import models

# Create your models here.
class Turno(models.Model):
    nombre = models.CharField(max_length=100, default=None)
    apellido = models.CharField(max_length=100, default=None)
    email = models.EmailField(max_length=100, default=None)
    telefono = models.CharField(max_length=20, default=None)
    edad = models.IntegerField(default=None)
    obra_social = models.CharField(max_length=100, default=None, null=True, blank=True)
    ciudad = models.CharField(max_length=100, default=None)
    fecha = models.DateField()
    hora = models.TimeField()
    fecha_hora = models.DateTimeField(default=None)
    encuentro = models.CharField(max_length=100, default=None)
    motivo = models.CharField(max_length=100)
    estado = models.CharField(max_length=50, default='Pendiente')

    def __str__(self):
        return f'Turno: {self.nombre} {self.apellido} - {self.encuentro} el {self.fecha} a las {self.hora}'
    
    def save(self, *args, **kwargs):
        naive_datetime = datetime.combine(self.fecha, self.hora)

        aware_datetime = timezone.make_aware(
            naive_datetime,
            timezone.get_current_timezone()
        )

        self.fecha_hora = aware_datetime

        super().save(*args, **kwargs)
        
    def to_json(self):
        fecha_local = localtime(self.fecha_hora)
        
        return {
            'id': self.id,
            'fecha_hora': fecha_local.strftime('%d/%m/%Y %H:%M'),
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email,
            'telefono': self.telefono,
            'edad': self.edad,
            'ciudad': self.ciudad,
            'obra_social': self.obra_social,
            'motivo': self.motivo,
            'encuentro': self.encuentro,
        }
    
class Horario(models.Model):
    dia_semana = models.CharField(max_length=20)
    hora_apertura = models.TimeField()
    hora_cierre = models.TimeField()
    habilitado = models.BooleanField(default=True)

    def __str__(self):
        return f'Horario: {self.dia_semana} de {self.hora_apertura.strftime("%H:%M")} a {self.hora_cierre.strftime("%H:%M")}'
    
    def to_json(self):
        return {
            'id': self.id,
            'dia_semana': self.dia_semana,
            'hora_apertura': self.hora_apertura.strftime('%H:%M'),
            'hora_cierre': self.hora_cierre.strftime('%H:%M'),
        }
    
class ConfiguracionTurnos(models.Model):
    minutos_entre_turnos = models.IntegerField(default=60)

    def __str__(self):
        return f'Tiempo entre turnos {self.minutos_entre_turnos} min'
    
class Feriado(models.Model):
    fecha = models.DateField()

    def __str__(self):
        return f'Feriado: El {self.fecha.strftime("%d/%m/%Y")}'

class Ciudad(models.Model):
    nombre = models.CharField(max_length=100)
    habilitada = models.BooleanField(default=True)
    con_consultorio = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre
    
    def to_json(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'habilitada': self.habilitada,
            'con_consultorio': self.con_consultorio,
        }