from datetime import datetime
from django.http import JsonResponse
from django.core.signing import TimestampSigner

from .models import Feriado

signer = TimestampSigner()

def calcular_horarios_disponibles(horarios, tiempo_entre_turnos):
    horarios_disponibles = []

    for horario in horarios:
        hora_inicio = datetime.combine(datetime.today(), horario.hora_apertura)
        hora_fin = datetime.combine(datetime.today(), horario.hora_cierre)

        while hora_inicio <= hora_fin:
            horarios_disponibles.append(hora_inicio.time())
            hora_inicio += tiempo_entre_turnos  # ya es timedelta

    return horarios_disponibles

def generar_token(turno_id):
    return signer.sign(turno_id)

def validar_token(token, max_age=60*60*24*7):  # 7 días
    try:
        turno_id = signer.unsign(token, max_age=max_age)
        return turno_id
    except Exception as e:
        print(f"Error al validar token: {e}")
        return None