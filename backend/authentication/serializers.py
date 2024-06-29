# from django.contrib.auth.models import User
# from django.db import models
# from rest_framework import serializers
# from .models import User, Division
# from django.utils.crypto import get_random_string

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('username', 'password')

#     extra_kwargs = {
#         'password': {'write_only': True},  # Ensures password is write-only
#     }

#     def create(self, validated_data):
#         password = validated_data.pop('password')
#         user = User(**validated_data)
#         user.set_password(password)
#         user.save()
#         return user


# class DivisionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Division
#         fields = '__all__'


# class UserFormSerializer(serializers.ModelSerializer):
#     user = UserSerializer(required=False)  # Make the UserSerializer optional
#     divisions = serializers.ListField(child=serializers.CharField())

#     class Meta:
#         model = User
#         fields = ('user', 'divisions')

#     def create(self, validated_data):
#         user_data = validated_data.pop('user', None)  # Allow user_data to be None
#         divisions = validated_data.pop('divisions')
        
#         if user_data is None or 'username' not in user_data:
#             username = get_random_string(length=10)  # Generate a random username
#         else:
#             username = user_data['username']

#         password = get_random_string(length=10)  # Generate a random password

#         user = User.objects.create(username=username)
#         user.set_password(password)
#         user.save()

#         user_form = UserForm.objects.create(user=user)

#         for division_name in divisions:
#             division, _ = Division.objects.get_or_create(name=division_name)
#             user_form.divisions.add(division)

#         return user_form

#     def to_representation(self, instance):
#         representation = super().to_representation(instance)
#         representation['user']['password'] = instance.user.password  # Include the plain-text password in the representation
#         return representation
    



from rest_framework import serializers
from .models import tenderDetail
from .models import User, Division


class TenderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = tenderDetail
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    divisions = serializers.StringRelatedField(many=True)

    class Meta:
        model = User
        fields = ['username', 'divisions', 'first_time', 'super_admin']