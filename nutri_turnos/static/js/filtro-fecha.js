$(document).ready(function(){
    optional_config = {
        altInput: true,
        altFormat: "j \\d\\e F \\d\\e Y",
        dateFormat: "Y-m-d",
        locale: {
            ...flatpickr.l10ns.es,
            firstDayOfWeek: 0
        },
        defaultDate: "today",
        disable: [
            function(date) {
            return (
                    date.getDay() === 0 || // domingo
                    date.getDay() === 6  // sábado

                );
            }
        ],
        onChange: function (selectedDates, dateStr, instance) {
                let fecha = selectedDates[0];
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

    $("#filtroFecha").flatpickr(optional_config);
    $('.flatpickr-months').addClass('rounded');

    $(".clear_button").click(function() {
        $('#filtroFecha').flatpickr().clear();
        $("#filtroFecha").flatpickr(optional_config);
    })
})

