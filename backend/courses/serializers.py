
from rest_framework import serializers
from .models import Course, Lesson, LessonProgress
class CourseSerializer(serializers.ModelSerializer):

    instructor_username = serializers.CharField(
        source='instructor.username',
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'instructor',
            'instructor_username',
            'category',
            'level',
            'price',
            'created_at'
        ]

        read_only_fields = [
            'instructor',
            'instructor_username'
        ]
class LessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson
        fields = [
            'id',
            'course',
            'title',
            'content',
            'order',
            'created_at'
        ]

        read_only_fields = ['created_at']


class LessonProgressSerializer(serializers.ModelSerializer):

    lesson_title = serializers.CharField(
        source='lesson.title',
        read_only=True
    )

    class Meta:
        model = LessonProgress
        fields = [
            'id',
            'lesson',
            'lesson_title',
            'completed',
            'completed_at'
        ]

        read_only_fields = ['completed_at']
