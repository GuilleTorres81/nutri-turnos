from django.contrib import admin

from .models import *
# Register your models here.
admin.site.register(Turno)
admin.site.register(Horario)
admin.site.register(Ciudad)
admin.site.register(ConfiguracionTurnos)
admin.site.register(Feriado)

