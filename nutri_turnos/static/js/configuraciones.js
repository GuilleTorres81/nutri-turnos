$(document).ready(function(){
    let url = $('#modalConfiguracion').data('url');
    // Peticion para obtener los horarios
    $.ajax({
        url: url,
        type: "GET",
        data: {
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function(response) {
            console.log(response);
            response.horarios.forEach(horario => {
                let html = `
                    <div>
                        <label 
                            for="horario_${horario.id}" 
                            class="btn btn-white diaButton"
                            data-apertura="${horario.hora_apertura}"
                            data-cierre="${horario.hora_cierre}"
                        >
                            ${horario.dia_semana}
                        </label>

                        <input 
                            type="radio" 
                            class="d-none" 
                            id="horario_${horario.id}" 
                            name="horario" 
                            value="${horario.id}"
                        >
                    </div>
                `;

                $('#diasContainer').append(html);
            });
            
        }
    })
})

$('#diasContainer').on('click', '.diaButton', function () {

    const radioId = $(this).attr('for');
    $('#' + radioId).prop('checked', true);

    $('.diaButton').removeClass('active');
    $(this).addClass('active');

    const apertura = $(this).data('apertura');
    const cierre = $(this).data('cierre');

    $('#horaApertura').val(apertura);
    $('#horaCierre').val(cierre);

});