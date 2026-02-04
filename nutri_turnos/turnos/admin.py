from django.contrib import admin

from .models import Turno, Horario, ConfiguracionTurnos
# Register your models here.
admin.site.register(Turno)
admin.site.register(Horario)
admin.site.register(ConfiguracionTurnos)

