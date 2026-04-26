# Nutri Turnos

Sistema de gestión de turnos para consultorios de nutrición. Permite a los pacientes reservar turnos online y al profesional administrar su agenda desde un panel privado.

## Funcionalidades

- **Formulario público** para que los pacientes reserven turnos eligiendo fecha, hora, ciudad, modalidad (consultorio o Google Meet) y motivo de consulta
- **Confirmación por email** automática al paciente con opción de cancelar desde el correo
- **Panel de administración** (con login) para ver, filtrar y cancelar turnos
- **Exportación** de la tabla de turnos a PDF
- **Configuración** de días/horarios de atención, ciudades habilitadas, tiempo entre turnos y correo de notificaciones
- **Feriados** argentinos detectados automáticamente (provincia de Salta), con posibilidad de agregar feriados personalizados

## Tecnologías

- Python / Django 6.0
- PostgreSQL (psycopg2)
- [Resend](https://resend.com) para envío de emails
- DataTables + Bootstrap 5 en el frontend
- Flatpickr para el selector de fechas
- Gunicorn + WhiteNoise para producción

