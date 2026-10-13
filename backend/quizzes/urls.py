from django.urls import path

from .views import (
    QuizListCreateView,
    QuizDetailView,
    QuestionListCreateView,
    QuestionDetailView,
    OptionListCreateView,
    OptionDetailView,
    QuizAttemptCreateView,
    QuizAttemptListView
)


urlpatterns = [

    path(
        'quizzes/',
        QuizListCreateView.as_view(),
        name='quiz-list-create'
    ),

    path(
        'quizzes/<int:quiz_id>/',
        QuizDetailView.as_view(),
        name='quiz-detail'
    ),

    path(
        'quizzes/<int:quiz_id>/questions/',
        QuestionListCreateView.as_view(),
        name='question-list-create'
    ),

    path(
        'quizzes/<int:quiz_id>/questions/<int:question_id>/',
        QuestionDetailView.as_view(),
        name='question-detail'
    ),

    path(
        'quizzes/<int:quiz_id>/questions/<int:question_id>/options/',
        OptionListCreateView.as_view(),
        name='option-list-create'
    ),

    path(
        'quizzes/<int:quiz_id>/questions/<int:question_id>/options/<int:option_id>/',
        OptionDetailView.as_view(),
        name='option-detail'
    ),

    path(
        'quizzes/<int:quiz_id>/attempt/',
        QuizAttemptCreateView.as_view(),
        name='quiz-attempt-create'
    ),

    path(
        'quizzes/attempts/',
        QuizAttemptListView.as_view(),
        name='quiz-attempt-list'
    ),

]