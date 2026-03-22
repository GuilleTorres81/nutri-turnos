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
                    // let params = $.param({
                    //     comida: $("#filtroComida").val(),
                    //     casino: $("#filtroCasino").val(),
                    //     fecha: $("#filtroFecha").val(),
                    // });
                    // window.location = "/export/pdf/?" + params;
                },
                escapeHtml: false,
            },
        ],
        ajax: {
            url: url, // Ruta a tu vista de servidor
            data: function (d) {
                // d.comida = $("#filtroComida").val();
                // d.casino = $("#filtroCasino").val();
                d.fecha = $("#filtroFecha").val();
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
                    if (data === "Tartagal") {
                        return `<span class="badge bg-success">${data}</span>`;
                    }else if (data === "Salta") {
                        return `<span class="badge bg-warning">${data}</span>`;
                    }
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

    // Detectar cambios en los filtros y recargar tabla
    $("#filtroFecha").on("change", function () {
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