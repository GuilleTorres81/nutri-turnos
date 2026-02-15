from django.urls import path
from .views import *

app_name = "turnos"

urlpatterns = [
    path("", registro_de_turnos, name="registro"),
    path('guardar-turno/', registrar_turno, name='registrar_turno'),
    path('datatable/', registro_datatable, name='datatable'),
]
