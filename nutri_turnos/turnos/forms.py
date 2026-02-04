from django import forms
from .models import Turno
from django.contrib.auth.models import User
from django.forms import ModelForm, DateTimeInput

class TurnoForm(ModelForm):
    class Meta:
        model = Turno
        fields = ['paciente', 'fecha', 'hora', 'motivo', 'estado']
        widgets = {
            'fecha_hora': DateTimeInput(attrs={'type': 'datetime-local'}),
        }
