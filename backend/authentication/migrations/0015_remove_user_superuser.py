# Generated by Django 3.2.18 on 2023-11-22 07:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0014_user_superuser'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='superUser',
        ),
    ]