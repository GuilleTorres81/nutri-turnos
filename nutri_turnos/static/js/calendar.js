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
        disable: [
            function(date) {
            // 0 = Domingo, 6 = Sábado
            return (
                    date.getDay() === 0 || // domingo
                    date.getDay() === 6 || // sábado
                    date.getDay() === 1    // lunes
                );
            }
        ],
        onChange: function (selectedDates, dateStr, instance) {
                let fecha = selectedDates[0];
                $('#modalHoraios').modal('show');
                // $.ajax({
                //     url: "/nutri_turnos/turnos_disponibles/",
                //     type: "GET",
                //     data: {
                //         'fecha': fecha
                //     },
                //     success: function (data) {
                //         $('#turnos').html(data);
                //     }
                // });
            }
    }

    calendar = $("#calendar").flatpickr(optional_config);
    $("#turnoForm > .input").addClass("d-none");
    $('.flatpickr-months').addClass('rounded');
})

$('#backButton').click(function(e){
    e.preventDefault();
    $('#turnoCard').addClass('d-none');
    $('.flatpickr-calendar').removeClass('d-none');
    $('#ciudaddDiv').removeClass('d-none');
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

    if (ciudadSeleccionada === 'Salta') {
        calendar.set('disable', [
            function (date) {
                return (
                    date.getDay() === 0 || // domingo
                    date.getDay() === 6 || // sábado
                    date.getDay() === 1    // lunes
                );
            }
        ]);
        $('#consultorioDiv').addClass('d-none');
        $('#googleMeetDiv > input').prop('checked', true);
    } else if (ciudadSeleccionada === 'Tartagal') {
        calendar.set('disable', [
            function (date) {
                return !(date.getDay() === 1);
            }
        ]);
        $('#consultorioDiv').removeClass('d-none');
    }
});

$('.botonHorario').click(function () {
    // Obtener la hora del data attribute
    const hora = $(this).data('hora');

    // Marcar el radio correspondiente
    const radioId = $(this).attr('for');
    $('#' + radioId).prop('checked', true);

    // Actualizar el input hidden type="time"
    $('#horaSeleccionada').val(hora);

    // Opcional: marcar botón activo visualmente
    $('.botonHorario').removeClass('active');
    $(this).addClass('active');
});

$('#botonCerrarModal').click(function(){
    $('#modalHoraios').modal('hide');
    $('#turnoCard').removeClass('d-none');
    $('.flatpickr-calendar').addClass('d-none');
    $('#ciudaddDiv').addClass('d-none');
})