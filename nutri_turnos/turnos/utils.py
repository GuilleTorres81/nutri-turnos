from datetime import datetime
from django.http import JsonResponse
from django.core.signing import TimestampSigner

from .models import Feriado

signer = TimestampSigner()

def generar_token(turno_id):
    return signer.sign(turno_id)

def validar_token(token, max_age=60*60*24*7):  # 7 días
    try:
        turno_id = signer.unsign(token, max_age=max_age)
        return turno_id
    except Exception as e:
        print(f"Error al validar token: {e}")
        return None