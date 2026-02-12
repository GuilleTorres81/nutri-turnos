from django import forms
from .models import Turno
from django.contrib.auth.models import User
from django.forms import ModelForm, DateTimeInput

class TurnoForm(forms.ModelForm):
    class Meta:
        model = Turno
        fields = ['nombre', 'apellido', 'fecha', 'hora', 'encuentro', 'motivo']
        widgets = {
            'fecha': forms.DateInput(attrs={'type': 'date'}),
            'hora': forms.TimeInput(attrs={'type': 'time'}),
        }