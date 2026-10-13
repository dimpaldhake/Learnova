from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Enrollment
from .serializers import EnrollmentSerializer
from quizzes.models import QuizAttempt
class EnrollmentListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        course_id = request.query_params.get("course")

        if course_id:

            # Only instructors can view all students
            # enrolled in a course
            if request.user.profile.user_type != "instructor":
                return Response(
                    {
                        "error": "Only instructors can view course enrollments."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            enrollments = Enrollment.objects.filter(
                course_id=course_id
            )

        else:

            # Students can view only their own enrollments
            enrollments = Enrollment.objects.filter(
                student=request.user
            )

        serializer = EnrollmentSerializer(
            enrollments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        course_id = request.data.get("course")

        # Check if the student is already enrolled
        existing_enrollment = Enrollment.objects.filter(
            student=request.user,
            course_id=course_id
        ).first()

        if existing_enrollment:

            return Response(
                {
                    "message": "You are already enrolled in this course.",
                    "enrollment_id": existing_enrollment.id
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EnrollmentSerializer(
            data=request.data
        )

        if serializer.is_valid():

            enrollment = serializer.save(
                student=request.user
            )

            return Response(
                EnrollmentSerializer(enrollment).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class EnrollmentDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_enrollment(self, enrollment_id):

        try:
            return Enrollment.objects.get(
                id=enrollment_id,
                student=self.request.user
            )

        except Enrollment.DoesNotExist:

            return None

    def get(self, request, enrollment_id):

        enrollment = self.get_enrollment(enrollment_id)

        if enrollment is None:

            return Response(
                {"error": "Enrollment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = EnrollmentSerializer(
            enrollment
        )

        return Response(
            serializer.data
        )

    def patch(self, request, enrollment_id):

        enrollment = self.get_enrollment(enrollment_id)

        if enrollment is None:

            return Response(
                {"error": "Enrollment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = EnrollmentSerializer(
            enrollment,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, enrollment_id):

        enrollment = self.get_enrollment(enrollment_id)

        if enrollment is None:

            return Response(
                {"error": "Enrollment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        enrollment.delete()

        return Response(
            {"message": "Enrollment deleted successfully."},
            status=status.HTTP_200_OK
        )
# Student Dashboard
# Student Dashboard
class StudentDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.profile.user_type != 'student':
            return Response(
                {
                    "error": "Only students can access the student dashboard."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        enrollments = Enrollment.objects.filter(
            student=request.user
        ).select_related('course')

        attempts = QuizAttempt.objects.filter(
            student=request.user
        ).select_related('quiz')

        from courses.models import LessonProgress

        progress = LessonProgress.objects.filter(
            student=request.user
        ).select_related('lesson')

        enrolled_courses = []

        for enrollment in enrollments:

            course = enrollment.course

            total_lessons = course.lessons.count()

            completed_lessons = progress.filter(
                lesson__course=course,
                completed=True
            ).count()

            if total_lessons > 0:
                progress_percentage = round(
                    (completed_lessons / total_lessons) * 100
                )
            else:
                progress_percentage = 0

            enrolled_courses.append(
                {
                    "id": course.id,
                    "title": course.title,
                    "status": enrollment.status,
                    "total_lessons": total_lessons,
                    "completed_lessons": completed_lessons,
                    "progress": progress_percentage
                }
            )

        data = {
            "student": {
                "username": request.user.username,
                "email": request.user.email
            },

            "enrolled_courses": enrolled_courses,

            "quiz_attempts": [
                {
                    "id": attempt.id,
                    "quiz_title": attempt.quiz.title,
                    "score": attempt.score,
                    "attempted_at": attempt.attempted_at
                }
                for attempt in attempts
            ],

            "lesson_progress": [
                {
                    "lesson_id": item.lesson.id,
                    "lesson_title": item.lesson.title,
                    "completed": item.completed,
                    "completed_at": item.completed_at
                }
                for item in progress
            ]
        }

        return Response(data)