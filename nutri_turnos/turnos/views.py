from datetime import datetime
from django.utils import timezone

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache

from django.db.models import Q, F
from django.http import JsonResponse

from .models import *
from .utils import *



def turnos_home(request):
    horarios = Horario.objects.all()
    delta = ConfiguracionTurnos.objects.first().tiempo_entre_turnos
    horarios_disponibles = calcular_horarios_disponibles(horarios, delta)
    
    context = {'horarios_disponibles': horarios_disponibles}
    return render(request, 'home.html', context)

def registrar_turno(request):
    if request.method == 'POST':
        try:
            nombre = request.POST['nombre']
            apellido = request.POST['apellido']
            email = request.POST['email']
            telefono = request.POST['telefono']
            edad = request.POST['edad']
            ciudad = request.POST['ciudad']
            encuentro = request.POST['encuentro']
            motivo = request.POST['motivo']
            
            fecha_str = request.POST['fecha']
            hora_str = request.POST['hora']

            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
            hora = datetime.strptime(hora_str, "%H:%M").time()
            
            turno = Turno(nombre=nombre, apellido=apellido, email=email, telefono=telefono, edad=edad, ciudad=ciudad, fecha=fecha, hora=hora, encuentro=encuentro, motivo=motivo)
            turno.save()
            return redirect('turnos_home')
        except Exception as e:
            print(f'Error al registrar el turno: {e}')
            return redirect('turnos_home')
    return redirect('turnos_home')


# region REGISTROS

# @login_required(login_url='login')
def registro_de_turnos(request):
    usuario=request.user        
    return render(request,"registro.html")

def registro_datatable(request):
    draw = request.GET.get('draw')
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    order_column_index = int(request.GET.get('order[0][column]', 0))
    order_direction = request.GET.get('order[0][dir]', 'asc')
    search_value = request.GET.get('search[value]', None)

    # filtro_comida = request.GET.get('comida')
    # filtro_casino = request.GET.get('casino')
    filtro_fecha  = request.GET.get('fecha')
    
    fecha_hoy = timezone.localdate()
    inicio_hoy = timezone.make_aware(
        datetime.combine(timezone.localdate(), datetime.min.time())
    )
    # Mapeo de índices a columnas del datatable
    column_mapping = {
        0: 'fecha_hora', 
        1: 'apellido', 
        2: 'nombre', 
        3: 'edad',
        4: 'telefono',
        5: 'email', 
        6: 'ciudad',
        7: 'motivo', 
        8: 'encuentro',
    }

    order_column = column_mapping.get(order_column_index, 'fecha_hora')
    if order_direction == 'asc':
        order_column = F(order_column).asc(nulls_last=True)
    else:
        order_column = F(order_column).desc(nulls_last=True)

    # Construimos dinámicamente las condiciones de búsqueda utilizando Q objects
    conditions = Q()
    if search_value:
        fields = [
            'apellido',
            'nombre',
        ]
        search_terms = search_value.split()
        for term in search_terms:
            term_conditions = Q()
            for field in fields:
                term_conditions |= Q(**{f"{field}__icontains": term})

            conditions &= term_conditions

    filtered_data = Turno.objects.filter(
        conditions,
        fecha_hora__gte=inicio_hoy
    )
    
    # Aplicamos filtros dinámicos
    # if filtro_comida:
    #     filtered_data = filtered_data.filter(comida=filtro_comida)
    # if filtro_casino:
    #     filtered_data = filtered_data.filter(casino=filtro_casino)
    if filtro_fecha:
        try:
            fecha_obj = datetime.strptime(filtro_fecha, "%Y-%m-%d").date()
            filtered_data = filtered_data.filter(fecha_hora__date=fecha_obj)
        except ValueError:
            print("Formato de fecha inválido:", filtro_fecha)    
    
        
    filtered_data = filtered_data.order_by(order_column)
    total_records = filtered_data.count()

    # Paginación
    data = [
        item.to_json()
        for item in filtered_data[start: start + length]
    ]   

    return JsonResponse({
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': total_records,
        'data': data
    })
    
# region PETICIONES AJAX
def get_feriados_ajax(request):
    if request.method == 'GET':
        feriados = Feriado.objects.all()
        fechas_feriados = [feriado.fecha.strftime('%Y-%m-%d') for feriado in feriados]
        return JsonResponse({'fechas_feriados': fechas_feriados})
    return JsonResponse({'error': 'Método no permitido'}, status=405)


def get_turnos_ajax(request):
    # Solo se devuelven los turnos del dia seleccionado
    if request.method == 'GET':
        fecha_str = request.GET.get('fecha')
        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
            turnos = Turno.objects.filter(fecha_hora__date=fecha)
            turnos_data = [turno.to_json() for turno in turnos]
            
            horarios_data = [horario.to_json() for horario in Horario.objects.filter(dia_semana=fecha.strftime('%A'))]
            
            return JsonResponse({'turnos': turnos_data, 'horarios': list(horarios_data)}, status=200)
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha inválido'}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)