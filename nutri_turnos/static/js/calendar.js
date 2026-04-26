// Mapeo de getDay() a nombre en inglés (igual que Python's strftime('%A'))
const DIA_SEMANA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let calendar;
let delta = 60;

$(document).ready(function () {
    const $calendar = $('#calendar');
    const diasUrl = $calendar.data('dias-url');
    const horariosUrl = $calendar.data('horarios-url');
    delta = parseInt($calendar.data('delta')) || 60;

    const optional_config = {
        altInput: true,
        altFormat: "j \\de F \\de Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        locale: {
            ...flatpickr.l10ns.es,
            firstDayOfWeek: 0
        },
        defaultDate: "today",
        inline: true,
        onChange: function (selectedDates, dateStr) {
            $('#fechaSeleccionada').val(dateStr);
            $('#modalHoraios').modal('show');

            const ciudadId = $('.ciudadChecker:checked').val();

            $.get(horariosUrl, { fecha: dateStr, ciudad_id: ciudadId }, function (response) {
                mostrarHorarios(response.horarios, response.turnos);
            });
        }
    };

    calendar = $calendar.flatpickr(optional_config);
    $("#calendarCardBody > .input").addClass("d-none");
    $('.flatpickr-months').addClass('rounded');

    const ciudadInicial = $('.ciudadChecker:checked').val();
    actualizarDisponibilidad(ciudadInicial);
    actualizarConsultorio();
});

function actualizarConsultorio() {
    const $checked = $('.ciudadChecker:checked');
    const conConsultorio = $checked.data('con-consultorio') == '1';
    $('#consultorioDiv').toggleClass('d-none', !conConsultorio);
    if (!conConsultorio) {
        $('#encuentro_2').prop('checked', true);
    }
}

function actualizarDisponibilidad(ciudadId) {
    const diasUrl = $('#calendar').data('dias-url');
    const feriadosUrl = $('#calendar').data('feriados-url');

    $.when(
        $.get(feriadosUrl),
        $.get(diasUrl, { ciudad_id: ciudadId })
    ).done(function (feriadosRes, diasRes) {
        const feriados = feriadosRes[0].fechas_feriados;
        const diasHabilitados = diasRes[0].dias_habilitados;

        const reglas = [...feriados];

        // Deshabilitar días que no están en diasHabilitados
        reglas.push(function (date) {
            return !diasHabilitados.includes(DIA_SEMANA[date.getDay()]);
        });

        calendar.set('disable', reglas);

        // Mostrar/ocultar consultorio según si la ciudad tiene con_consultorio
        // (se puede extender si el backend lo devuelve)
    });
}

$('.ciudadChecker').change(function () {
    actualizarDisponibilidad($(this).val());
    actualizarConsultorio();
});

$('#diasContainer').on('click', '.diaButton', function () {
    const radioId = $(this).attr('for');
    $('#' + radioId).prop('checked', true);
    $('.diaButton').removeClass('active');
    $(this).addClass('active');
    $('#horaApertura').val($(this).data('apertura'));
    $('#horaCierre').val($(this).data('cierre'));
});

$('#horariosDisponibles').on('click', '.botonHorario', function () {
    const hora = $(this).data('hora');
    const radioId = $(this).attr('for');
    $('#' + radioId).prop('checked', true);
    $('#horaSeleccionada').val(hora);
    $('.botonHorario').removeClass('active');
    $(this).addClass('active');
});

$('#botonConfirmarHorario').click(function (e) {
    e.preventDefault();
    if (!$('#horaSeleccionada').val()) {
        $('#spanWarning').removeClass('d-none');
        setTimeout(() => $('#spanWarning').addClass('d-none'), 3000);
        return;
    }
    changeFechaHoraText();
    $('#modalHoraios').modal('hide');
    $('#turnoCard').removeClass('d-none');
    $('#calendarCard').addClass('d-none');
});

$('#backButton').click(function (e) {
    e.preventDefault();
    $('#turnoCard').addClass('d-none');
    $('#calendarCard').removeClass('d-none');
});

$('#inputOtro').click(function () {
    $('#motivo_4').prop('checked', true);
});

$('#inputOtro').change(function () {
    const valor = $(this).val().trim();
    $('#motivo_4').val(valor !== '' ? valor : 'otro');
});

function mostrarHorarios(horarios, turnos) {
    $('#horaSeleccionada').val('');
    const container = $('#horariosDisponibles');
    container.html('');

    if (!horarios.length) {
        container.html('<p>No hay horarios disponibles</p>');
        return;
    }

    const horasOcupadas = turnos.map(t => t.fecha_hora.substring(11, 16));
    let contador = 1;

    horarios.forEach(function (h) {
        const [hInicio, mInicio] = h.hora_apertura.split(':').map(Number);
        const [hFin, mFin] = h.hora_cierre.split(':').map(Number);
        const inicioMin = hInicio * 60 + mInicio;
        const finMin = hFin * 60 + mFin;

        for (let min = inicioMin; min <= finMin; min += delta) {
            const horaStr = `${Math.floor(min / 60).toString().padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`;
            const disabled = horasOcupadas.includes(horaStr);

            container.append(`
                <div class="col-auto">
                    <label class="btn ${disabled ? 'btn-secondary disabled' : 'btn-white'} fw-bold botonHorario"
                        data-hora="${horaStr}" for="horario_${contador}">
                        ${horaStr}
                    </label>
                    <input type="radio" name="horario" id="horario_${contador}"
                        value="${horaStr}" class="d-none" ${disabled ? 'disabled' : ''}>
                </div>
            `);
            contador++;
        }
    });
}

function changeFechaHoraText() {
    $('#fechaHoraText').text(
        `Turno del ${calendar.selectedDates[0].toLocaleDateString('es-AR', { month: 'long', day: 'numeric' })} a las ${$('#horaSeleccionada').val()}`
    );
}
