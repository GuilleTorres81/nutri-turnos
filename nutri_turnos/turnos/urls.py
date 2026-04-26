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
    path('get-configuracion/', get_configuracion, name='get_configuracion'),
    path('update-configuracion/', update_configuracion, name='update_configuracion'),
    path('update-horario/<int:horario_id>/', update_horario, name='update_horario'),
    path('update-ciudad/<int:ciudad_id>/', update_ciudad, name='update_ciudad'),
    path('crear-ciudad/', crear_ciudad, name='crear_ciudad'),
    path('eliminar-ciudad/<int:ciudad_id>/', eliminar_ciudad, name='eliminar_ciudad'),
    path('get-dias-habilitados/', get_dias_habilitados, name='get_dias_habilitados'),
    path('export-pdf-data/', export_pdf_data, name='export_pdf_data'),
]
