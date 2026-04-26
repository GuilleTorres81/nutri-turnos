from datetime import datetime, date
import holidays
import resend

from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.cache import never_cache
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.conf import settings
from django.urls import reverse

from django.db.models import Q, F
from django.http import JsonResponse, HttpResponse

from .models import *
from .utils import *

resend.api_key = settings.RESEND_API_KEY

# region LOGIN
@never_cache
def login_view(request):
    print("Usuario en sesión:", request.user)
    if request.user.is_authenticated:
        return redirect('turnos:registro')  

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('turnos:registro')
        else:
            messages.error(request, "Usuario o contraseña incorrectos.")
            
    return render(request, "login.html")

def logout_view(request):
    logout(request)  # elimina la sesión del usuario
    return redirect("turnos:login")  # cambia "login" por el nombre de tu url de login


# regin HOME
def turnos_home(request):
    ciudades = Ciudad.objects.filter(habilitada=True)
    return render(request, 'home.html', {'ciudades': ciudades})

def registrar_turno(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        nombre = request.POST.get('nombre')
        apellido = request.POST.get('apellido')
        email = request.POST.get('email')
        telefono = request.POST.get('telefono')
        edad = request.POST.get('edad')
        ciudad = request.POST.get('ciudad')
        encuentro = request.POST.get('encuentro')
        motivo = request.POST.get('motivo')

        fecha_str = request.POST.get('fecha')
        hora_str = request.POST.get('hora')

        # 🧪 Validaciones básicas
        if not all([nombre, apellido, email, fecha_str, hora_str]):
            return JsonResponse({
                'error': 'Faltan campos obligatorios'
            }, status=400)

        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
            hora = datetime.strptime(hora_str, "%H:%M").time()
            if Turno.objects.filter(fecha=fecha, hora=hora).exists():
                print(f"Intento de registro duplicado para {fecha} {hora}")
                return JsonResponse({
                    'error': 'Ya existe un turno para esa fecha y hora'
                }, status=400)
        except ValueError:
            return JsonResponse({
                'error': 'Formato de fecha u hora inválido'
            }, status=400)

        turno = Turno.objects.create(
            nombre=nombre,
            apellido=apellido,
            email=email,
            telefono=telefono,
            edad=edad,
            ciudad=ciudad,
            fecha=fecha,
            hora=hora,
            encuentro=encuentro,
            motivo=motivo
        )
        try:
            enviar_confirmacion_turno(turno.id)
        except Exception as e:
            print(f"Error al enviar email de confirmación: {e}")
            
        return JsonResponse({
            'message': 'Turno registrado correctamente',
            'id': turno.id
        }, status=201)

    except Exception as e:
        return JsonResponse({
            'error': 'Error interno del servidor',
            'details': str(e)  # opcional, útil en dev
        }, status=500)

def enviar_confirmacion_turno(turno_id):
    turno = get_object_or_404(Turno, id=turno_id)

    token = generar_token(turno.id)
    path = reverse('turnos:cancelar_turno_por_mail', args=[token])
    cancel_url = f"{settings.DOMAIN}{path}"

    context = {
        'turno': turno,
        'cancel_url': cancel_url
    }

    html_content = render_to_string('emails/confirmacion_turno.html', context)

    resend.Emails.send({
        "from": settings.DEFAULT_FROM_EMAIL, 
        "to": [turno.email],
        "subject": "Confirmación de turno",
        "html": html_content,
    })
    
    
def cancelar_turno_por_mail(request, token):
    turno_id = validar_token(token)

    if not turno_id:
        return HttpResponse("Link inválido o expirado", status=400)

    try:
        turno = Turno.objects.get(id=turno_id)
        print(turno)
        turno.estado = "Cancelado"
        turno.delete()
        return HttpResponse("El turno fue cancelado correctamente")
    except Turno.DoesNotExist:
        return HttpResponse("Turno no encontrado", status=404)

def cancelar_turno(request, turno_id):
    if request.method == 'POST':
        try:
            turno = Turno.objects.get(id=turno_id)
            turno.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            print(f'Error al cancelar el turno: {e}')
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Método no permitido'})
# region REGISTROS

@login_required(login_url='turnos:login')
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

    # filtro_ciudad = request.GET.get('ciudad')
    # filtro_motivo = request.GET.get('motivo')
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
    # if filtro_ciudad:
    #     filtered_data = filtered_data.filter(ciudad=filtro_ciudad)
    # if filtro_motivo:
    #     filtered_data = filtered_data.filter(motivo=filtro_motivo)
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

    if request.method != 'GET':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    anio_actual = datetime.now().year

    ar_holidays = holidays.country_holidays(
        "AR",
        subdiv="A",
        years=range(anio_actual, anio_actual + 10)
    )

    fechas_holidays = [d.strftime('%Y-%m-%d') for d in ar_holidays.keys()]

    feriados_db = Feriado.objects.all()
    fechas_db = [f.fecha.strftime('%Y-%m-%d') for f in feriados_db]

    fechas_feriados = list(set(fechas_holidays + fechas_db))

    return JsonResponse({'fechas_feriados': fechas_feriados})


def get_turnos_ajax(request):
    # Solo se devuelven los turnos del dia seleccionado
    if request.method == 'GET':
        fecha_str = request.GET.get('fecha')
        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
            turnos = Turno.objects.filter(fecha_hora__date=fecha)
            turnos_data = [turno.to_json() for turno in turnos]
            
            ciudad_id = request.GET.get('ciudad_id')
            qs = Horario.objects.filter(dia_semana=fecha.strftime('%A'))
            if ciudad_id:
                qs = qs.filter(ciudad_id=ciudad_id)
            horarios_data = [horario.to_json() for horario in qs]

            return JsonResponse({'turnos': turnos_data, 'horarios': horarios_data}, status=200)
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha inválido'}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def get_horarios_ajax(request):
    if request.method == 'GET':
        try:
            horarios = Horario.objects.all()
            horarios_data = [horario.to_json() for horario in horarios]
            return JsonResponse({'horarios': horarios_data}, status=200)
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha inválido'}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def get_dias_habilitados(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    ciudad_id = request.GET.get('ciudad_id')
    qs = Horario.objects.all()
    if ciudad_id:
        qs = qs.filter(ciudad_id=ciudad_id)
    dias = list(qs.values_list('dia_semana', flat=True))
    return JsonResponse({'dias_habilitados': dias})

def get_ciudades_ajax(request):
    if request.method == 'GET':
        try:
            ciudades = Ciudad.objects.all()
            ciudades = [ciudad.to_json() for ciudad in ciudades]
            return JsonResponse({'ciudades': ciudades}, status=200)
        except ValueError:
            return JsonResponse({'error': 'Error al obtener ciudades'}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

import json

def update_horario(request, horario_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        horario = get_object_or_404(Horario, id=horario_id)
        data = json.loads(request.body)
        horario.hora_apertura = data.get('hora_apertura', horario.hora_apertura)
        horario.hora_cierre = data.get('hora_cierre', horario.hora_cierre)
        ciudad_id = data.get('ciudad_id')
        horario.ciudad = Ciudad.objects.get(id=ciudad_id) if ciudad_id else None
        horario.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def update_ciudad(request, ciudad_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        ciudad = get_object_or_404(Ciudad, id=ciudad_id)
        data = json.loads(request.body)
        ciudad.habilitada = data.get('habilitada', ciudad.habilitada)
        ciudad.con_consultorio = data.get('con_consultorio', ciudad.con_consultorio)
        ciudad.save()
        if not ciudad.habilitada:
            Horario.objects.filter(ciudad=ciudad).update(ciudad=None)
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def crear_ciudad(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        data = json.loads(request.body)
        nombre = data.get('nombre', '').strip()
        if not nombre:
            return JsonResponse({'error': 'El nombre es obligatorio'}, status=400)
        ciudad = Ciudad.objects.create(nombre=nombre)
        return JsonResponse({'success': True, 'ciudad': ciudad.to_json()}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def eliminar_ciudad(request, ciudad_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        ciudad = get_object_or_404(Ciudad, id=ciudad_id)
        Horario.objects.filter(ciudad=ciudad).update(ciudad=None)
        ciudad.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)