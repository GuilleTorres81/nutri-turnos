from datetime import datetime
from django.shortcuts import render
from .forms import TurnoForm
from .models import Turno
def turnos_home(request):
    form = TurnoForm()
    context = {'form': form}
    return render(request, 'home.html', context)

def registrar_turno(request):
    if request.method == 'POST':
        try:
            nombre = request.POST['nombre']
            apellido = request.POST['apellido']
            email = request.POST['email']
            encuentro = request.POST['encuentro']
            motivo = request.POST['motivo']
            
            fecha_str = request.POST['fecha']
            hora_str = request.POST['hora']

            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
            hora = datetime.strptime(hora_str, "%H:%M").time()
            
            turno = Turno(nombre=nombre, apellido=apellido, email=email, fecha=fecha, hora=hora, encuentro=encuentro, motivo=motivo)
            turno.save()
            return render(request, 'home.html', {'success': 'Turno registrado exitosamente'})
        except Exception as e:
            print(f'Error al registrar el turno: {e}')
            return render(request, 'home.html', {'error': 'Error al registrar el turno'})
    return render(request, 'home.html')