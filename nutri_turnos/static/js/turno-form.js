$(document).ready(function() {
    $('#turnoForm').submit(function(event) {
        if(!checkInputs() || !checkOtherInput() || !checkMotivos()){
            event.preventDefault(); // solo bloquea si hay error
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