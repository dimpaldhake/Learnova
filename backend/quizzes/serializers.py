from rest_framework import serializers
from .models import Quiz, Question, Option,QuizAttempt


class QuizSerializer(serializers.ModelSerializer):

    class Meta:
        model = Quiz

        fields = [
            'id',
            'course',
            'title',
            'description',
            'instructor',
            'created_at'
        ]

        read_only_fields = [
            'instructor',
            'created_at'
        ]
class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question

        fields = [
            'id',
            'quiz',
            'question_text',
            'marks'
        ]
class OptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Option

        fields = [
            'id',
            'question',
            'option_text',
            'is_correct'
        ]
class QuizAttemptSerializer(serializers.ModelSerializer):

    quiz_title = serializers.CharField(
        source='quiz.title',
        read_only=True
    )

    class Meta:
        model = QuizAttempt
        fields = [
            'id',
            'student',
            'quiz',
            'quiz_title',
            'score',
            'attempted_at'
        ]
        read_only_fields = [
            'student',
            'score',
            'attempted_at',
            'quiz_title'
        ]