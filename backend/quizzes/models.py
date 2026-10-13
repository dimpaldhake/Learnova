from django.db import models
from django.contrib.auth.models import User
from courses.models import Course


class Quiz(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='quizzes'
    )

    title = models.CharField(max_length=200)

    description = models.TextField(
        blank=True
    )

    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_quizzes'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title

class Question(models.Model):

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions'
    )

    question_text = models.TextField()

    marks = models.PositiveIntegerField(
        default=1
    )

    def __str__(self):
        return self.question_text
class Option(models.Model):

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='options'
    )

    option_text = models.CharField(
        max_length=255
    )

    is_correct = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.option_text

class QuizAttempt(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='quiz_attempts'
    )

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='attempts'
    )

    score = models.PositiveIntegerField(
        default=0
    )

    attempted_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title}"