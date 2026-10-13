from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from enrollments.models import Enrollment
from courses.models import Course

from .models import Quiz, Question, Option, QuizAttempt
from .serializers import (
    QuizSerializer,
    QuestionSerializer,
    OptionSerializer,
    QuizAttemptSerializer
)


# Quiz List + Create
class QuizListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_type = request.user.profile.user_type

        if user_type == 'student':
            enrolled_course_ids = Enrollment.objects.filter(
                student=request.user,
                status='active'
            ).values_list('course_id', flat=True)

            quizzes = Quiz.objects.filter(
                course_id__in=enrolled_course_ids
            ).select_related('course', 'instructor')

        elif user_type == 'instructor':
            quizzes = Quiz.objects.filter(
                instructor=request.user
            ).select_related('course', 'instructor')

        else:
            quizzes = Quiz.objects.none()

        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def post(self, request):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can create quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        course_id = request.data.get('course')

        course = Course.objects.filter(
            id=course_id
        ).first()

        if course is None:
            return Response(
                {
                    "error": "Course not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if course.instructor != request.user:
            return Response(
                {
                    "error": "You can only create quizzes for your own courses."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = QuizSerializer(
            data=request.data
        )

        if serializer.is_valid():

            quiz = serializer.save(
                instructor=request.user
            )

            return Response(
                QuizSerializer(quiz).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# Quiz Detail - View, Update, Delete
class QuizDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_quiz(self, quiz_id):
        return Quiz.objects.filter(id=quiz_id).select_related(
            'course', 'instructor'
        ).first()

    def can_view_quiz(self, request, quiz):
        user_type = request.user.profile.user_type

        if user_type == 'instructor':
            return quiz.instructor_id == request.user.id

        if user_type == 'student':
            return Enrollment.objects.filter(
                student=request.user,
                course_id=quiz.course_id,
                status='active'
            ).exists()

        return False

    def get(self, request, quiz_id):
        quiz = self.get_quiz(quiz_id)

        if quiz is None:
            return Response(
                {"error": "Quiz not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not self.can_view_quiz(request, quiz):
            return Response(
                {"error": "You do not have access to this quiz."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

    def put(self, request, quiz_id):

        return self.update_quiz(
            request,
            quiz_id,
            partial=False
        )

    def patch(self, request, quiz_id):

        return self.update_quiz(
            request,
            quiz_id,
            partial=True
        )

    def update_quiz(
        self,
        request,
        quiz_id,
        partial=False
    ):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can update quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        quiz = self.get_quiz(quiz_id)

        if quiz is None:
            return Response(
                {
                    "error": "Quiz not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only update your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = QuizSerializer(
            quiz,
            data=request.data,
            partial=partial
        )

        if serializer.is_valid():

            updated_quiz = serializer.save()

            return Response(
                QuizSerializer(updated_quiz).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, quiz_id):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can delete quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        quiz = self.get_quiz(quiz_id)

        if quiz is None:
            return Response(
                {
                    "error": "Quiz not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only delete your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        quiz.delete()

        return Response(
            {
                "message": "Quiz deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )


# Question List + Create
class QuestionListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        quiz = Quiz.objects.filter(id=quiz_id).first()

        if quiz is None:
            return Response(
                {"error": "Quiz not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        user_type = request.user.profile.user_type
        if user_type == 'instructor':
            allowed = quiz.instructor_id == request.user.id
        elif user_type == 'student':
            allowed = Enrollment.objects.filter(
                student=request.user,
                course_id=quiz.course_id,
                status='active'
            ).exists()
        else:
            allowed = False

        if not allowed:
            return Response(
                {"error": "You do not have access to this quiz."},
                status=status.HTTP_403_FORBIDDEN
            )

        questions = Question.objects.filter(quiz_id=quiz_id)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request, quiz_id):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can create questions."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        quiz = Quiz.objects.filter(
            id=quiz_id
        ).first()

        if quiz is None:
            return Response(
                {
                    "error": "Quiz not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only add questions to your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = QuestionSerializer(
            data={
                **request.data,
                "quiz": quiz_id
            }
        )

        if serializer.is_valid():

            question = serializer.save()

            return Response(
                QuestionSerializer(question).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# Question Detail - View, Update, Delete
class QuestionDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_question(self, quiz_id, question_id):

        return Question.objects.filter(
            id=question_id,
            quiz_id=quiz_id
        ).first()

    def get(self, request, quiz_id, question_id):
        question = self.get_question(quiz_id, question_id)

        if question is None:
            return Response(
                {"error": "Question not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        quiz = question.quiz
        user_type = request.user.profile.user_type
        if user_type == 'instructor':
            allowed = quiz.instructor_id == request.user.id
        elif user_type == 'student':
            allowed = Enrollment.objects.filter(
                student=request.user,
                course_id=quiz.course_id,
                status='active'
            ).exists()
        else:
            allowed = False

        if not allowed:
            return Response(
                {"error": "You do not have access to this question."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = QuestionSerializer(question)
        return Response(serializer.data)

    def put(self, request, quiz_id, question_id):

        return self.update_question(
            request,
            quiz_id,
            question_id,
            partial=False
        )

    def patch(self, request, quiz_id, question_id):

        return self.update_question(
            request,
            quiz_id,
            question_id,
            partial=True
        )

    def update_question(
        self,
        request,
        quiz_id,
        question_id,
        partial=False
    ):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can update questions."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        question = self.get_question(
            quiz_id,
            question_id
        )

        if question is None:
            return Response(
                {
                    "error": "Question not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if question.quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only update questions in your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = QuestionSerializer(
            question,
            data=request.data,
            partial=partial
        )

        if serializer.is_valid():

            updated_question = serializer.save()

            return Response(
                QuestionSerializer(updated_question).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, quiz_id, question_id):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can delete questions."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        question = self.get_question(
            quiz_id,
            question_id
        )

        if question is None:
            return Response(
                {
                    "error": "Question not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if question.quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only delete questions in your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        question.delete()

        return Response(
            {
                "message": "Question deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )


# Option List + Create
class OptionListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id, question_id):
        question = Question.objects.filter(
            id=question_id,
            quiz_id=quiz_id
        ).select_related('quiz', 'quiz__course', 'quiz__instructor').first()

        if question is None:
            return Response(
                {"error": "Question does not belong to this quiz."},
                status=status.HTTP_404_NOT_FOUND
            )

        quiz = question.quiz
        user_type = request.user.profile.user_type

        if user_type == 'instructor':
            allowed = quiz.instructor_id == request.user.id
        elif user_type == 'student':
            allowed = Enrollment.objects.filter(
                student=request.user,
                course_id=quiz.course_id,
                status='active'
            ).exists()
        else:
            allowed = False

        if not allowed:
            return Response(
                {"error": "You do not have access to these options."},
                status=status.HTTP_403_FORBIDDEN
            )

        options = Option.objects.filter(question=question)

        if user_type == 'instructor':
            serializer = OptionSerializer(options, many=True)
            return Response(serializer.data)

        # Do not expose the correct answer to students before submission.
        data = [
            {
                "id": option.id,
                "question": option.question_id,
                "option_text": option.option_text
            }
            for option in options
        ]
        return Response(data)

    def post(self, request, quiz_id, question_id):
        print(
                "DEBUG OPTION:",
                request.user.username,
               request.user.profile.user_type,
                  "QUIZ:",
               quiz_id,
              "QUESTION:",
               question_id
             )

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can create options."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        question = Question.objects.filter(
            id=question_id,
            quiz_id=quiz_id
        ).first()

        if question is None:
            return Response(
                {
                    "error": "Question does not belong to this quiz."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        quiz = question.quiz

        if quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only add options to your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = OptionSerializer(
            data={
                **request.data,
                "question": question_id
            }
        )

        if serializer.is_valid():

            option = serializer.save()

            return Response(
                OptionSerializer(option).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# Option Detail - View, Update, Delete
class OptionDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_option(
        self,
        quiz_id,
        question_id,
        option_id
    ):

        return Option.objects.filter(
            id=option_id,
            question_id=question_id,
            question__quiz_id=quiz_id
        ).first()

    def get(
        self,
        request,
        quiz_id,
        question_id,
        option_id
    ):
        option = self.get_option(quiz_id, question_id, option_id)

        if option is None:
            return Response(
                {"error": "Option not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        quiz = option.question.quiz
        user_type = request.user.profile.user_type

        if user_type == 'instructor':
            allowed = quiz.instructor_id == request.user.id
        elif user_type == 'student':
            allowed = Enrollment.objects.filter(
                student=request.user,
                course_id=quiz.course_id,
                status='active'
            ).exists()
        else:
            allowed = False

        if not allowed:
            return Response(
                {"error": "You do not have access to this option."},
                status=status.HTTP_403_FORBIDDEN
            )

        if user_type == 'instructor':
            serializer = OptionSerializer(option)
            return Response(serializer.data)

        return Response({
            "id": option.id,
            "question": option.question_id,
            "option_text": option.option_text
        })

    def put(
        self,
        request,
        quiz_id,
        question_id,
        option_id
    ):

        return self.update_option(
            request,
            quiz_id,
            question_id,
            option_id,
            partial=False
        )

    def patch(
        self,
        request,
        quiz_id,
        question_id,
        option_id
    ):

        return self.update_option(
            request,
            quiz_id,
            question_id,
            option_id,
            partial=True
        )

    def update_option(
        self,
        request,
        quiz_id,
        question_id,
        option_id,
        partial=False
    ):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can update options."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        option = self.get_option(
            quiz_id,
            question_id,
            option_id
        )

        if option is None:
            return Response(
                {
                    "error": "Option not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if option.question.quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only update options in your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = OptionSerializer(
            option,
            data=request.data,
            partial=partial
        )

        if serializer.is_valid():

            updated_option = serializer.save()

            return Response(
                OptionSerializer(updated_option).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(
        self,
        request,
        quiz_id,
        question_id,
        option_id
    ):

        if request.user.profile.user_type != 'instructor':
            return Response(
                {
                    "error": "Only instructors can delete options."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        option = self.get_option(
            quiz_id,
            question_id,
            option_id
        )

        if option is None:
            return Response(
                {
                    "error": "Option not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if option.question.quiz.instructor != request.user:
            return Response(
                {
                    "error": "You can only delete options in your own quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        option.delete()

        return Response(
            {
                "message": "Option deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )


# Quiz Attempt
class QuizAttemptCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):

        if request.user.profile.user_type != 'student':
            return Response(
                {
                    "error": "Only students can attempt quizzes."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        quiz = Quiz.objects.filter(
            id=quiz_id
        ).first()

        if quiz is None:
            return Response(
                {
                    "error": "Quiz not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=quiz.course,
            status='active'
        ).first()

        if enrollment is None:
            return Response(
                {
                    "error": "You must be enrolled in this course to attempt the quiz."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        answers = request.data.get(
            "answers",
            []
        )

        score = 0

        for answer in answers:

            option_id = answer.get(
                "option_id"
            )

            option = Option.objects.filter(
                id=option_id,
                question__quiz=quiz
            ).first()

            if option and option.is_correct:
                score += option.question.marks

        attempt = QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            score=score
        )

        serializer = QuizAttemptSerializer(
            attempt
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


# Quiz Attempt History
class QuizAttemptListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        attempts = QuizAttempt.objects.filter(
            student=request.user
        )

        serializer = QuizAttemptSerializer(
            attempts,
            many=True
        )

        return Response(
            serializer.data
        )