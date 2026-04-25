from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('turnos', '0007_seed_horarios'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='horario',
            name='habilitado',
        ),
    ]
