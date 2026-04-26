const DIAS_ES = {
    Monday: 'Lunes',
    Tuesday: 'Martes',
    Wednesday: 'Miércoles',
    Thursday: 'Jueves',
    Friday: 'Viernes',
    Saturday: 'Sábado',
    Sunday: 'Domingo',
};

const ORDEN_DIAS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

$(document).ready(function () {
    const $modal = $('#modalConfiguracion');
    const horariosUrl = $modal.data('horarios-url');
    const ciudadesUrl = $modal.data('ciudades-url');
    const updateHorarioBase = $modal.data('update-horario-url');
    const updateCiudadBase = $modal.data('update-ciudad-url');
    const csrf = $('input[name="csrfmiddlewaretoken"]').first().val();

    function horarioUrl(id) {
        return updateHorarioBase.replace('/0/', `/${id}/`);
    }
    function ciudadUrl(id) {
        return updateCiudadBase.replace('/0/', `/${id}/`);
    }

    // Cargar ciudades
    $.get(ciudadesUrl, function (response) {
        response.ciudades.forEach(ciudad => {
            const btnClass = ciudad.habilitada ? 'btn-success' : 'btn-outline-secondary';
            $('#ciudadesContainer').append(`
                <button type="button"
                    class="btn btn-sm ${btnClass} ciudadToggle"
                    data-id="${ciudad.id}"
                    data-habilitada="${ciudad.habilitada ? '1' : '0'}"
                >
                    ${ciudad.nombre}
                </button>
            `);
            $('#ciudadHorarioSelect').append(
                `<option value="${ciudad.id}">${ciudad.nombre}</option>`
            );
        });
    });

    // Cargar horarios
    $.get(horariosUrl, function (response) {
        const horarios = response.horarios.sort(
            (a, b) => ORDEN_DIAS.indexOf(a.dia_semana) - ORDEN_DIAS.indexOf(b.dia_semana)
        );
        horarios.forEach(horario => {
            const tieneciudad = !!horario.ciudad_id;
            $('#diasContainer').append(`
                <button type="button"
                    class="btn btn-sm ${tieneciudad ? 'btn-primary' : 'btn-outline-secondary'} diaButton"
                    data-id="${horario.id}"
                    data-apertura="${horario.hora_apertura}"
                    data-cierre="${horario.hora_cierre}"
                    data-ciudad="${horario.ciudad_id ?? ''}"
                >
                    ${DIAS_ES[horario.dia_semana] ?? horario.dia_semana}
                </button>
            `);
        });
    });

    // Seleccionar día → cargar sus datos en los controles
    $('#diasContainer').on('click', '.diaButton', function () {
        $('.diaButton').removeClass('ring-active');
        $(this).addClass('ring-active');
        $('#horaApertura').val($(this).data('apertura'));
        $('#horaCierre').val($(this).data('cierre'));
        $('#ciudadHorarioSelect').val($(this).data('ciudad') || '');
        $('#horariosContainer').show();
    });

    let messageTimer = null;
    function showMessage(texto, tipo = 'success') {
        clearTimeout(messageTimer);
        $('#messageBox')
            .text(texto)
            .removeClass('text-success text-danger')
            .addClass(`text-${tipo}`);
        messageTimer = setTimeout(() => $('#messageBox').text('').removeClass('text-success text-danger'), 2500);
    }

    // Toggle habilitado de ciudad
    $('#ciudadesContainer').on('click', '.ciudadToggle', function () {
        const $btn = $(this);
        const id = $btn.data('id');
        const nuevoEstado = $btn.data('habilitada') != '1';

        $.ajax({
            url: ciudadUrl(id),
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': csrf },
            data: JSON.stringify({ habilitada: nuevoEstado }),
            success: function () {
                $btn.data('habilitada', nuevoEstado ? '1' : '0')
                    .toggleClass('btn-success', nuevoEstado)
                    .toggleClass('btn-outline-secondary', !nuevoEstado);
                showMessage(`${$btn.text().trim()} ${nuevoEstado ? 'habilitada' : 'deshabilitada'}`, nuevoEstado ? 'success' : 'danger');

                if (!nuevoEstado) {
                    const ciudadId = String($btn.data('id'));
                    $('.diaButton').each(function () {
                        if (String($(this).data('ciudad')) === ciudadId) {
                            $(this).data('ciudad', '')
                                .removeClass('btn-primary')
                                .addClass('btn-outline-secondary');
                        }
                    });
                }
            }
        });
    });

    // Guardar cambios del día seleccionado
    $('#botonGuardarCambios').on('click', function () {
        const $diaActivo = $('.diaButton.ring-active');
        if (!$diaActivo.length) return;

        const id = $diaActivo.data('id');
        const hora_apertura = $('#horaApertura').val();
        const hora_cierre = $('#horaCierre').val();
        const ciudad_id = $('#ciudadHorarioSelect').val() || null;

        $.ajax({
            url: horarioUrl(id),
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': csrf },
            data: JSON.stringify({ hora_apertura, hora_cierre, ciudad_id }),
            success: function () {
                const tieneciudad = !!ciudad_id;
                $diaActivo
                    .data('apertura', hora_apertura)
                    .data('cierre', hora_cierre)
                    .data('ciudad', ciudad_id || '')
                    .toggleClass('btn-primary', tieneciudad)
                    .toggleClass('btn-outline-secondary', !tieneciudad);
                showMessage(`Horario de ${$diaActivo.text().trim()} actualizado`);
            }
        });
    });

    // Ocultar panel de horario al abrir el modal
    $('#modalConfiguracion').on('show.bs.modal', function () {
        $('#horariosContainer').hide();
        $('.diaButton').removeClass('ring-active');
        clearTimeout(messageTimer);
        $('#messageBox').text('').removeClass('text-success text-danger');
    });
});
