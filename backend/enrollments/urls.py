from django.urls import path

from .views import (
    EnrollmentListCreateView,
    EnrollmentDetailView,
    StudentDashboardView
)


urlpatterns = [

    path(
        'enrollments/',
        EnrollmentListCreateView.as_view(),
        name='enrollment-list-create'
    ),

    path(
        'enrollments/<int:enrollment_id>/',
        EnrollmentDetailView.as_view(),
        name='enrollment-detail'
    ),

    path(
        'student-dashboard/',
        StudentDashboardView.as_view(),
        name='student-dashboard'
    ),
]