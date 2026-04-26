let idRowClicked;
$(document).ready(function () {
    const url = $("#registroTable").data("url");
    dataTable = $("#registroTable").DataTable({
        responsive: {
            enabled: true,
            details: {
                type: "column", // permite expandir al hacer clic
                target: "tr", // clic en toda la fila
            },
        },
        processing: true,
        serverSide: true,
        dom: "Bfrtip",
        buttons: [
            {
                text: '<i class="fa-regular fa-file-pdf"></i> PDF',
                className: "btn btn-danger btn-sm",
                action: function () {
                    const pdfUrl = $('#registroTable').data('pdf-url');
                    const fecha    = $('#filtroFecha').val();
                    const ciudad   = $('#filtroCiudad').val();
                    const motivo   = $('#filtroMotivo').val();
                    const encuentro = $('#filtroEncuentro').val();

                    $.get(pdfUrl, { fecha, ciudad, motivo, encuentro }, function (response) {
                        const rows = response.data;

                        // Nombre del archivo
                        const partes = [];
                        if (fecha)   partes.push(fecha);
                        if (ciudad)  partes.push(ciudad);
                        if (motivo)  partes.push(motivo);
                        const nombreArchivo = partes.length ? `Registro de ${partes.join(' - ')}` : 'Registro de turnos';

                        // Filas de la tabla
                        const cuerpo = [
                            [
                                { text: 'Fecha y Hora', bold: true },
                                { text: 'Apellido',     bold: true },
                                { text: 'Nombre',       bold: true },
                                { text: 'Edad',         bold: true },
                                { text: 'Teléfono',     bold: true },
                                { text: 'Email',        bold: true },
                                { text: 'Ciudad',       bold: true },
                                { text: 'Motivo',       bold: true },
                                { text: 'Encuentro',    bold: true },
                            ],
                            ...rows.map(r => [
                                r.fecha_hora,
                                r.apellido,
                                r.nombre,
                                String(r.edad),
                                r.telefono,
                                r.email,
                                r.ciudad,
                                r.motivo,
                                r.encuentro,
                            ])
                        ];

                        const docDefinition = {
                            pageOrientation: 'landscape',
                            content: [
                                { text: nombreArchivo, style: 'header' },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: ['auto','auto','auto','auto','auto','*','auto','*','auto'],
                                        body: cuerpo,
                                    },
                                    layout: 'lightHorizontalLines',
                                }
                            ],
                            styles: {
                                header: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] }
                            },
                            defaultStyle: { fontSize: 8 }
                        };

                        pdfMake.createPdf(docDefinition).download(`${nombreArchivo}.pdf`);
                    });
                },
                escapeHtml: false,
            },
        ],
        ajax: {
            url: url, // Ruta a tu vista de servidor
            data: function (d) {
                d.fecha     = $("#filtroFecha").val();
                d.ciudad    = $("#filtroCiudad").val();
                d.motivo    = $("#filtroMotivo").val();
                d.encuentro = $("#filtroEncuentro").val();
            },
            dataSrc: "data", // nombre del campo que contiene la lista de alarmas
        },
        columnDefs: [
            // { responsivePriority: 1, targets: [3, 4, 5] }, // documento, casino, comida visibles en móvil
            // { responsivePriority: 2, targets: [0, 1, 2] }, // los demás se ocultan primero
        ],
        columns: [
            { data: "fecha_hora"},
            { data: "apellido" },
            { data: "nombre" },
            { data: "edad" },
            { data: 
                "telefono",
                render: function (data, type, row) {
                    return `<a href="https://wa.me/${data}" target="_blank">${data}</a>`;
                }
            },
            { data: "email" },
            { data: 
                "ciudad",
                render: function (data, type, row) {
                    return data ? `<span class="badge bg-secondary">${data}</span>` : '';
                }
            },
            { data: "motivo" },
            { data: "encuentro" },
            // Columna de acciones (editar, eliminar)
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return `
                        <div class="d-flex gap-2 justify-content-center">
                            <button class="btn btn-sm btn-primary btn-editar" data-id="${row.id}">
                                <i class="fa-solid fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${row.id}" data-bs-toggle="modal" data-bs-target="#modalEliminar">
                                <i class="fa-solid fa-x"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        language: {
            decimal: "",
            emptyTable: "No hay turnos que mostrar en la tabla",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 de 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron registros",
            lengthMenu: "Mostrar MENU registros",
            search: "",
            paginate: {
                first: "|<<",
                last: ">>|",
                next: ">",
                previous: "<",
            },
            infoFiltered: "(Filtrado de MAX total entradas)",
            infoPostFix: "",
            thousands: ",",
            searchPlaceholder: "Buscar",
        },
        deferRender: true,
        lengthChange: false,
    });

    $('.dt-search').addClass('mt-2 mb-1');
    $('.dt-search input').addClass('rounded col-md-3 col-12 border-light bg-white');
    $(".dt-info").addClass("text-center");
    $(".dt-paging").addClass("d-flex justify-content-center");
    $(".dt-buttons").addClass("d-flex align-items-center justify-content-center gap-2");
    $(".dt-button").removeClass("dt-button");

    $("#filtroFecha, #filtroCiudad, #filtroMotivo, #filtroEncuentro").on("change", function () {
        dataTable.ajax.reload();
    });
});

$('#registroTable').on('click', '.btn-eliminar', function() {
    idRowClicked = $(this).data('id');
    let rawFecha = $(this).closest('tr').find('td:first').text().trim();
    let [fechaPart, horaPart] = rawFecha.split(' ');
    let [dia, mes, anio] = fechaPart.split('/');
    let fechaISO = `${anio}-${mes}-${dia}${horaPart ? 'T' + horaPart : ''}`;
    let formatFecha = new Date(fechaISO);
    let rowFecha = formatFecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    rowNombre = $(this).closest('tr').find('td:nth-child(3)').text();
    rowApellido = $(this).closest('tr').find('td:nth-child(2)').text();
    $('#modalEliminar .modal-body').html(`¿Confirma que desea cancelar el turno de <b>${rowNombre} ${rowApellido}</b> programado para el <b>${rowFecha}</b>?`);
});

$('#confirmarEliminar').on('click', function() {
    $.ajax({
        url: `/turnos/cancelar-turno/${idRowClicked}/`,
        type: 'POST',
        headers: {
            'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val()
        },
        success: function(response) {
            if (response.success) {
                $('#modalEliminar').modal('hide');
                // Recargar la tabla para reflejar el cambio
                $('#registroTable').DataTable().ajax.reload();
                // Mostrar mensaje de éxito (puedes usar un toast o alert)
                alert('Turno cancelado exitosamente.');
            } else {
                alert('Error al cancelar el turno.');
            }
        },
        error: function() {
            alert('Ocurrió un error al intentar cancelar el turno.');
        }
    });
});