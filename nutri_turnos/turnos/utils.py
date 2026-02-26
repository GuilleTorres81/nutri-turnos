from datetime import datetime
from django.http import JsonResponse
from .models import Feriado


def calcular_horarios_disponibles(horarios, tiempo_entre_turnos):
    horarios_disponibles = []

    for horario in horarios:
        hora_inicio = datetime.combine(datetime.today(), horario.hora_apertura)
        hora_fin = datetime.combine(datetime.today(), horario.hora_cierre)

        while hora_inicio <= hora_fin:
            horarios_disponibles.append(hora_inicio.time())
            hora_inicio += tiempo_entre_turnos  # ya es timedelta

    return horarios_disponibles