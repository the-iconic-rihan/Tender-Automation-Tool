# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

# from .models import User, Division

# class UserAdmin(DefaultUserAdmin):
#     list_display = ('username', 'last_login', 'division_list', 'first_time')
#     readonly_fields = ('last_login',)

#     def division_list(self, obj):
#         return ", ".join([division.name for division in obj.divisions.all()])

#     division_list.short_description = 'Divisions'

#     fieldsets = (
#         (None, {'fields': ('username', 'password')}),
#         ('Personal Info', {'fields': ('first_name', 'last_name', 'email')}),
#         ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser',)}),
#         ('Important dates', {'fields': ('last_login', 'date_joined')}),
#         ('Divisions', {'fields': ('divisions',)}),
#         ('First Time', {'fields': ('first_time',)}),
#     )

#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('username', 'divisions', 'first_time'),
#         }),
#     )


# admin.site.register(User, UserAdmin)
# admin.site.register(Division)

from django.contrib import admin
from .models import User, Division, tenderDetail

admin.site.register(Division)
admin.site.register(User)
admin.site.register(tenderDetail)

# Register your models here.
