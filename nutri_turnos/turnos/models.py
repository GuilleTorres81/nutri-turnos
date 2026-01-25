from django.db import models

# Create your models here.
class Turno(models.Model):
    paciente = models.CharField(max_length=100)
    fecha_hora = models.DateTimeField()
    motivo = models.TextField()
    estado = models.CharField(max_length=50, default='Pendiente')

    def __str__(self):
        return f'Turno de {self.paciente} el {self.fecha_hora.strftime("%Y-%m-%d %H:%M")}'