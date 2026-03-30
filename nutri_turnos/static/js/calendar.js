let calendar;
$(document).ready(function(){
    optional_config = {
        altInput: true,
        altFormat: "j \\d\\e F \\d\\e Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        locale: {
            ...flatpickr.l10ns.es,
            firstDayOfWeek: 0
        },
        defaultDate: "today",
        inline: true,
        onChange: function (selectedDates, dateStr, instance) {
                let fecha = selectedDates[0];
                $('#fechaSeleccionada').val(dateStr);
                $('#modalHoraios').modal('show');
                url = $('#calendar').data('horarios-url');
                $.ajax({
                    url: url,
                    type: "GET",
                    data: {
                        fecha: dateStr
                    },

                    success: function (response) {

                        let turnos = response.turnos;
                        let horarios = response.horarios;

                        mostrarHorarios(horarios, turnos);

                    },

                    error: function (xhr) {
                        console.log("Error:", xhr.responseJSON);
                    }
                });
            }
    }

    calendar = $("#calendar").flatpickr(optional_config);
    $("#calendarCardBody > .input").addClass("d-none");
    $('.flatpickr-months').addClass('rounded');
    
    let ciudadInicial = $('.ciudadChecker:checked').val();
    actualizarDisponibilidad(ciudadInicial);
})

// FUNCIONES
function actualizarDisponibilidad(ciudad) {
    setFeriados().done(function (data) {

        let reglas = [];
        let feriados = data.fechas_feriados;

        // Deshabilitar feriados
        reglas.push(...feriados);

        // Reglas según ciudad
        if (ciudad === 'Salta') {
            reglas.push(function (date) {
                return (
                    date.getDay() === 0 ||
                    date.getDay() === 6 ||
                    date.getDay() === 5
                );
            });

            // $('#consultorioDiv').addClass('d-none');
            $('#googleMeetDiv > input').prop('checked', true);

        } else if (ciudad === 'Tartagal') {
            reglas.push(function (date) {
                return !(date.getDay() === 5);
            });

            // $('#consultorioDiv').removeClass('d-none');
        }

        calendar.set('disable', reglas);
    });
}

function setFeriados() {
    let url = $('#calendar').data('feriados-url');
    return $.ajax({
        url: url,
        type: "GET"
    });
}

// EVENTOS
$('#backButton').click(function(e){
    e.preventDefault();
    $('#turnoCard').addClass('d-none');
    $('#calendarCard').removeClass('d-none');
})

$('#inputOtro').click(function(){
    $('#motivo_4').prop('checked', true);
})

$('#inputOtro').change(function(){
    let valor = $(this).val();  
    if (valor.trim() !== '') {
        $('#motivo_4').val(valor);
    } else {
        $('#motivo_4').val('otro');
    }
})

$('.ciudadChecker').change(function () {
    let ciudadSeleccionada = $(this).val();
    actualizarDisponibilidad(ciudadSeleccionada);
});

$('#horariosDisponibles').on('click', '.botonHorario', function () {
    const hora = $(this).data('hora');
    const radioId = $(this).attr('for');

    $('#' + radioId).prop('checked', true);
    $('#horaSeleccionada').val(hora);
    $('.botonHorario').removeClass('active');
    $(this).addClass('active');
});

$('#botonConfirmarHorario').click(function(e){
    e.preventDefault();
    if(!$('#horaSeleccionada').val()) {
        $('#spanWarning').removeClass('d-none');
        setTimeout(() => {
            $('#spanWarning').addClass('d-none');
        }, 3000);
        return;
    }
    changeFechaHoraText();
    $('#modalHoraios').modal('hide');
    $('#turnoCard').removeClass('d-none');
    $('#calendarCard').addClass('d-none');
})


function mostrarHorarios(horarios, turnos) {
    $('#horaSeleccionada').val('');

    let container = $("#horariosDisponibles");
    container.html("");

    if (horarios.length === 0) {
        container.html("<p>No hay horarios disponibles</p>");
        return;
    }

    // horas ocupadas
    let horasOcupadas = turnos.map(t => {
        return t.hora || t.fecha_hora.substring(11,16);
    });

    let contador = 1;

    horarios.forEach(function(h) {

        let [hInicio, mInicio] = h.hora_apertura.split(":").map(Number);
        let [hFin, mFin] = h.hora_cierre.split(":").map(Number);

        let inicioMin = hInicio * 60 + mInicio;
        let finMin = hFin * 60 + mFin;

        for (let min = inicioMin; min <= finMin; min += 60) {

            let hora = Math.floor(min / 60).toString().padStart(2, '0');
            let minuto = (min % 60).toString().padStart(2, '0');
            let horaStr = `${hora}:${minuto}`;

            let disabled = horasOcupadas.includes(horaStr);

            let html = `
                <div class="col-auto">
                    <label 
                        class="btn ${disabled ? 'btn-secondary disabled' : 'btn-white'} fw-bold botonHorario"
                        data-hora="${horaStr}"
                        for="horario_${contador}"
                    >
                        ${horaStr}
                    </label>

                    <input 
                        type="radio"
                        name="horario"
                        id="horario_${contador}"
                        value="${horaStr}"
                        class="d-none"
                        ${disabled ? "disabled" : ""}
                    >
                </div>
            `;

            container.append(html);
            contador++;
        }

    });
}

function changeFechaHoraText() {
    $('#fechaHoraText').text(`Turno del ${calendar.selectedDates[0].toLocaleDateString('es-AR', {
        month: 'long',
        day: 'numeric'
    })} a las ${$('#horaSeleccionada').val()}`);
}