from django.db import migrations


def seed_ciudades(apps, schema_editor):
    Ciudad = apps.get_model('turnos', 'Ciudad')
    for nombre in ['Salta', 'Tartagal']:
        Ciudad.objects.get_or_create(nombre=nombre)


class Migration(migrations.Migration):

    dependencies = [
        ('turnos', '0005_horario_ciudad'),
    ]

    operations = [
        migrations.RunPython(seed_ciudades, migrations.RunPython.noop),
    ]
