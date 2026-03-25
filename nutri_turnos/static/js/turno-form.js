let camposValidos = true;
$(document).ready(function() {
    $('#turnoSubmitButton').click(function(event) {
        event.preventDefault();

        const data = $('#turnoForm').serialize();
        const url = $('#turnoForm').data('url');

        if (checkInputs() && checkOtherInput() && checkMotivos()) {
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                dataType: "json",
                headers: {
                    'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
                },
                success: function (response) {
                    mensajeConfirmacion();

                    $('#turnoForm')[0].reset();
                    $('#turnoForm input').removeClass('is-valid is-invalid');
                    $('#turnoCard').addClass('d-none');
                    $('#calendarCard').removeClass('d-none');
                },
                error: function (xhr, status, error) {
                    mensajeError()
                    console.error(xhr.responseText); // 👈 clave para debug
                }
            });
        }
    });
});

function checkInputs(){
    let inputs = $('#turnoForm input[required]');
    let allFilled = true;

    inputs.each(function() {
        if ($(this).val().trim() === '') {
            $(this).removeClass('is-valid').addClass('is-invalid');
            allFilled = false;
            return false;
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    return allFilled;
}

function checkOtherInput(){
    if($('#motivo_4').is(':checked')){
        if($('#inputOtro').val().trim() === ''){
            $('#inputOtro').removeClass('is-valid').addClass('is-invalid');
            return false;
        }

        $('#inputOtro').removeClass('is-invalid').addClass('is-valid');
        return true;
    }

    $('#inputOtro').removeClass('is-invalid is-valid');
    return true;
}

function checkMotivos(){
    if($('input[name="motivo"]:checked').length > 0){
        $('#motivoWarning').addClass('d-none');
        return true;
    } else {
        $('#motivoWarning').removeClass('d-none');
        setTimeout(() => {
                $('#motivoWarning').addClass('d-none');
            }, 5000);
        return false;
    }
}

function mensajeConfirmacion(){
    let nombre = $('#nombre').val();
    let apellido = $('#apellido').val();

    $('#modalMensajeTitle').text('Turno Guardado');
    $('#modalMensajeBody').html(

        `<i class="fa-regular fa-circle-check text-success fs-1"></i>
        <p>Turno para <b>${nombre} ${apellido}</b> el <b>${calendar.selectedDates[0].toLocaleDateString('es-AR', {
            month: 'long',
            day: 'numeric'
        })}</b> a las <b>${$('#horaSeleccionada').val()}</b> se reservó correctamente.</p>`
    );
    $('#spanWarning').removeClass('d-none');
    $('#modalMensaje').modal('show');
}

function mensajeError(){
    $('#modalMensajeTitle').text('Error');
    $('#modalMensajeBody').html(`
        <i class="fa-regular fa-circle-xmark text-danger fs-1"></i>
        <p>Hubo un error al solicitar el turno. Por favor, inténtalo de nuevo.</p>
        <p>Es posible que el turno ya no esté disponible, recuerde que <b>debe llegarle la confirmación por e-mail</b>.</p>
        `);
    $('#spanWarning').addClass('d-none');
    $('#modalMensaje').modal('show');
}

$('#edad').on('input', function() {
    let edad = parseInt($(this).val());
    if (isNaN(edad) || edad < 0 || edad > 100) {
        $(this).val('');
    }
});

$('#email').on('input', function() {
    let email = $(this).val();
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        $(this).addClass('is-invalid').removeClass('is-valid');
    } 
    else {$(this).addClass('is-valid').removeClass('is-invalid');
    }
});

$('#telefono').on('input', function() {
    let telefono = $(this).val();
    let regex = /^\d{10}$/;
    if (!regex.test(telefono)) {
        $(this).addClass('is-invalid').removeClass('is-valid');
    } else {
        $(this).addClass('is-valid').removeClass('is-invalid');
    }
});