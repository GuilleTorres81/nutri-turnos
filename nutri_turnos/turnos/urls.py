from django.urls import path
from .views import *

app_name = "turnos"

urlpatterns = [
    path("", registro_de_turnos, name="registro"),
    path('login/', login_view, name='login'),
    path("logout/", logout_view, name="logout"),
    path('guardar-turno/', registrar_turno, name='registrar_turno'),
    path("cancelar-turno/<int:turno_id>/", cancelar_turno, name="cancelar_turno"),
    path('cancelar-turno-email/<str:token>/', cancelar_turno_por_mail, name='cancelar_turno_por_mail'),
    path('datatable/', registro_datatable, name='datatable'),
    path('feriados/', get_feriados_ajax, name='get_feriados'),
    path('get-turnos/', get_turnos_ajax, name='get_turnos'),
    path('get-horarios/', get_horarios_ajax, name='get_horarios'),
    path('get-ciudades/', get_ciudades_ajax, name='get_ciudades'),
]
