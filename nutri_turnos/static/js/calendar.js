$(document).ready(function(){
    
    optional_config = {
        altInput: true,
        altFormat: "j \\d\\e F \\d\\e Y",
        dateFormat: "Y-m-d",
        locale: "es",
        defaultDate: "today",
        inline: true,
        onChange: function (selectedDates, dateStr, instance) {
                let fecha = selectedDates[0];
                $('#turnoCard').removeClass('d-none');
                $('.flatpickr-calendar').addClass('d-none');
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

    $("#calendar").flatpickr(optional_config);
    $("#turnoForm > .input").addClass("d-none");
    $('.flatpickr-months').addClass('rounded');
})

$('#backButton').click(function(e){
    e.preventDefault();
    $('#turnoCard').addClass('d-none');
    $('.flatpickr-calendar').removeClass('d-none');
})