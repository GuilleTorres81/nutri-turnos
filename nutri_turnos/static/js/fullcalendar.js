document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar')

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    selectable: true,
    dateClick: function (info) {
      const selectedDate = info.dateStr
      const dateInput = document.getElementById('id_fecha_turno')
      dateInput.value = selectedDate
      // Mostrar el formulario
      const form = document.querySelector('form')
      form.classList.remove('d-none')
    },
    
  })

  calendar.render()
})