from django.urls import path
from . import views

app_name = "turnos"

urlpatterns = [
    path('guardar-turno/', views.registrar_turno, name='registrar_turno'),
]
