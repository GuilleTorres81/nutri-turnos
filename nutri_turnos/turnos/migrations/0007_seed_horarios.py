from django.db import migrations


DIAS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']


def seed_horarios(apps, schema_editor):
    Horario = apps.get_model('turnos', 'Horario')
    for dia in DIAS:
        Horario.objects.get_or_create(
            dia_semana=dia,
            defaults={'hora_apertura': '09:00', 'hora_cierre': '18:00'},
        )


class Migration(migrations.Migration):

    dependencies = [
        ('turnos', '0006_seed_ciudades'),
    ]

    operations = [
        migrations.RunPython(seed_horarios, migrations.RunPython.noop),
    ]
