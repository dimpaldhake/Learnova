from django.urls import path

from .views import (
    CourseListCreateView,
    CourseDetailView,
    LessonListCreateView,
    LessonDetailView,
    LessonProgressView
)

urlpatterns = [
    path('courses/', CourseListCreateView.as_view(), name='course-list-create'),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),

    path('lessons/', LessonListCreateView.as_view(), name='lesson-list-create'),
    path('lessons/<int:lesson_id>/', LessonDetailView.as_view(), name='lesson-detail'),

    path(
        'lesson-progress/',
        LessonProgressView.as_view(),
        name='lesson-progress'
    ),
]
