from django.urls import path
from . import views

urlpatterns = [
    path('', views.turnos_home, name='turnos_home'),
    # Otras URLs de la aplicación 'turnos'
]
