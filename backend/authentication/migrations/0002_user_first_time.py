# Generated by Django 3.2.7 on 2023-06-30 11:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='first_time',
            field=models.BooleanField(default=True),
        ),
    ]