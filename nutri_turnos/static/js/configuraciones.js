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
    const crearCiudadUrl = $modal.data('crear-ciudad-url');
    const eliminarCiudadBase = $modal.data('eliminar-ciudad-url');
    const getConfiguracionUrl = $modal.data('get-configuracion-url');
    const updateConfiguracionUrl = $modal.data('update-configuracion-url');
    const csrf = $('input[name="csrfmiddlewaretoken"]').first().val();

    function horarioUrl(id) {
        return updateHorarioBase.replace('/0/', `/${id}/`);
    }
    function ciudadUrl(id) {
        return updateCiudadBase.replace('/0/', `/${id}/`);
    }
    function eliminarCiudadUrl(id) {
        return eliminarCiudadBase.replace('/0/', `/${id}/`);
    }

    function renderCiudad(ciudad) {
        const btnClass = ciudad.habilitada ? 'btn-success' : 'btn-outline-secondary';
        const consultorioIcon = ciudad.con_consultorio
            ? '<i class="fas fa-clinic-medical ms-1" title="Con consultorio"></i>'
            : '';
        const $wrapper = $(`
            <div class="d-inline-flex align-items-center gap-1 ciudadWrapper" data-id="${ciudad.id}">
                <button type="button"
                    class="btn btn-sm ${btnClass} ciudadToggle"
                    data-id="${ciudad.id}"
                    data-habilitada="${ciudad.habilitada ? '1' : '0'}"
                    data-con-consultorio="${ciudad.con_consultorio ? '1' : '0'}"
                >
                    ${ciudad.nombre}${consultorioIcon}
                </button>
                <button type="button" class="btn btn-sm btn-outline-info consultorioToggle" title="Toggle consultorio" data-id="${ciudad.id}">
                    <i class="fas fa-clinic-medical"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger ciudadEliminar" title="Eliminar ciudad" data-id="${ciudad.id}" data-nombre="${ciudad.nombre}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `);
        $('#ciudadesContainer').append($wrapper);
        $('#ciudadHorarioSelect').append(`<option value="${ciudad.id}">${ciudad.nombre}</option>`);
    }

    // Cargar ciudades
    $.get(ciudadesUrl, function (response) {
        response.ciudades.forEach(renderCiudad);
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
        $('#horariosInfo').text(`Configurando ${$(this).text().trim()}`);
    });

    let messageTimer = null;
    function showMessage(texto, tipo = 'success') {
        const clasePermitida = tipo === 'danger' ? 'text-danger' : 'text-success';
        clearTimeout(messageTimer);
        $('#messageBox')
            .text(texto)
            .removeClass('text-success text-danger')
            .addClass(clasePermitida);
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
                    const ciudadId = String(id);
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

    // Toggle con_consultorio
    $('#ciudadesContainer').on('click', '.consultorioToggle', function () {
        const id = $(this).data('id');
        const $ciudadBtn = $(`.ciudadToggle[data-id="${id}"]`);
        const nuevoEstado = $ciudadBtn.data('con-consultorio') != '1';

        $.ajax({
            url: ciudadUrl(id),
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': csrf },
            data: JSON.stringify({ con_consultorio: nuevoEstado }),
            success: function () {
                $ciudadBtn.data('con-consultorio', nuevoEstado ? '1' : '0');
                const nombre = $ciudadBtn.data('nombre') || $ciudadBtn.text().replace(/\s+/g, ' ').trim().split(' ')[0];
                const icono = nuevoEstado ? ' <i class="fas fa-clinic-medical ms-1" title="Con consultorio"></i>' : '';
                $ciudadBtn.html(`${nombre}${icono}`);
                showMessage(`Consultorio ${nuevoEstado ? 'activado' : 'desactivado'}`);
            }
        });
    });

    // Eliminar ciudad
    $('#ciudadesContainer').on('click', '.ciudadEliminar', function () {
        const id = $(this).data('id');
        const nombre = $(this).data('nombre');
        if (!confirm(`¿Eliminar la ciudad "${nombre}"? Los días asignados a esta ciudad quedarán sin ciudad.`)) return;

        $.ajax({
            url: eliminarCiudadUrl(id),
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': csrf },
            data: JSON.stringify({}),
            success: function () {
                $(`.ciudadWrapper[data-id="${id}"]`).remove();
                $(`#ciudadHorarioSelect option[value="${id}"]`).remove();
                $('.diaButton').each(function () {
                    if (String($(this).data('ciudad')) === String(id)) {
                        $(this).data('ciudad', '')
                            .removeClass('btn-primary')
                            .addClass('btn-outline-secondary');
                    }
                });
                showMessage(`${nombre} eliminada`, 'danger');
            }
        });
    });

    // Crear nueva ciudad
    $('#btnCrearCiudad').on('click', function () {
        const nombre = $('#nuevaCiudadInput').val().trim();
        if (!nombre) return;

        $.ajax({
            url: crearCiudadUrl,
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': csrf },
            data: JSON.stringify({ nombre }),
            success: function (response) {
                renderCiudad(response.ciudad);
                $('#nuevaCiudadInput').val('');
                showMessage(`${response.ciudad.nombre} creada`);
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

        $.get(getConfiguracionUrl, function (data) {
            $('#deltaTurnos').val(data.minutos_entre_turnos);
            $('#emailContacto').val(data.email_notificaciones);
        });
    });

    $('#btnGuardarDelta').on('click', function () {
        const minutos = parseInt($('#deltaTurnos').val());
        if (isNaN(minutos) || minutos < 0) return;
        $.ajax({
            url: updateConfiguracionUrl,
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': csrf },
            data: JSON.stringify({ minutos_entre_turnos: minutos }),
            success: () => showMessage('Tiempo entre turnos actualizado'),
            error: () => showMessage('Error al guardar', 'danger'),
        });
    });

    $('#btnGuardarEmail').on('click', function () {
        const email = $('#emailContacto').val().trim();
        $.ajax({
            url: updateConfiguracionUrl,
            type: 'POST',
            contentType: 'application/json',
            headers: { 'X-CSRFToken': csrf },
            data: JSON.stringify({ email_notificaciones: email }),
            success: () => showMessage('Correo de notificaciones actualizado'),
            error: () => showMessage('Error al guardar', 'danger'),
        });
    });
});
