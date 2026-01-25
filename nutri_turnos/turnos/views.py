from django.shortcuts import render
from .forms import TurnoForm
def turnos_home(request):
    form = TurnoForm()
    context = {'form': form}
    return render(request, 'home.html', context)

def registrar_turno(request):
    form = TurnoForm()
    if request.method == 'POST':
        try:
            form = TurnoForm(request.POST)
            if form.is_valid():
                form.save()
            return render(request, 'registrar_turno.html', {'success': 'Turno registrado exitosamente'})
        except Exception as e:
            print(f'Error al registrar el turno: {e}')
            return render(request, 'registrar_turno.html', {'error': 'Error al registrar el turno'})
    return render(request, 'registrar_turno.html')