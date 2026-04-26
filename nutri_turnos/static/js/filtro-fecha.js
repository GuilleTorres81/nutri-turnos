$(document).ready(function(){
    optional_config = {
        altInput: true,
        altFormat: "j \\d\\e F \\d\\e Y",
        dateFormat: "Y-m-d",
        locale: {
            ...flatpickr.l10ns.es,
            firstDayOfWeek: 0
        },
        disable: [
            function(date) {
            return (
                    date.getDay() === 0 
                );
            }
        ],
        onChange: function (selectedDates, dateStr, instance) {
                let fecha = selectedDates[0];
                $('#cleanButton').removeClass('d-none')
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

    const fpFecha = $("#filtroFecha").flatpickr(optional_config);
    fpFecha.altInput.placeholder = 'Filtrar por fecha';
    $('.flatpickr-months').addClass('rounded');

    $("#cleanButton").click(function() {
        fpFecha.clear();
        fpFecha.altInput.placeholder = 'Filtrar por fecha';
        $(this).addClass('d-none');
    })
})

