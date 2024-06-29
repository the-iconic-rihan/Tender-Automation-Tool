import random
import string
from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.contrib.auth.hashers import make_password
from django.utils import timezone
# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

class Division(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class CustomUserManager(UserManager):
    def _create_user(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_active',False)
        extra_fields.setdefault('is_super_admin', False)  # New field

        if not username:
            raise ValueError('The Username field must be set')

        user = self.model(username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.password = make_password(user.generate_password())
        user.save(using=self._db)
        return user

    def create_user(self, username, password=None, **extra_fields):
        return self._create_user(username, password, **extra_fields)

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_super_admin', True)  # New field


        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('super_user must have is_superuser=True.')

        # If password is provided, hash it
        if password:
            extra_fields['password'] = make_password(password)
        else:
            extra_fields['password'] = make_password(self.model.generate_password())

        return self._create_user(username, password, **extra_fields)



class User(AbstractUser):
    divisions = models.ManyToManyField(Division)
    first_time = models.BooleanField(default=True)
    super_admin = models.BooleanField(default=False)
    password = models.CharField(blank=True, max_length=150)

    # objects = CustomUserManager()

    def __str__(self):
        return self.username


class tenderDetail(models.Model):
    FILE_STATUS = (
        ('FILE UPLOADED', 'FILE UPLOADED'),
        ('FILE UPLOADING', 'FILE UPLOADING'),
        ('NO FILE UPLOADED', 'NO FILE UPLOADED')
    )

    TENDER_STATUS = (
        ('SUCCEEDED', 'SUCCEEDED'),
        ('UPLOADING', 'UPLOADING'),
        ('NO FILE UPLOADED', 'NO FILE UPLOADED'),
        ('PROCESSING', 'PROCESSING')
    )
    id = models.AutoField(primary_key=True)
    tender_name = models.CharField(max_length=150)
    tender_number = models.IntegerField()
    division = models.ForeignKey(Division, on_delete=models.CASCADE)
    publishing_date = models.DateField(blank=True, null=True)   
    file_upload_status = models.CharField(choices=FILE_STATUS, max_length=150)
    tender_status = models.CharField(choices=TENDER_STATUS, max_length=150)
    upload_date = models.DateTimeField(default=timezone.now)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_date')
    modified_date = models.DateTimeField(blank=True, null=True)
    modified_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='updated_date', blank=True, null=True)

    def __str__(self):
        return self.tender_name
