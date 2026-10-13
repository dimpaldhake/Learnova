from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollments.models import Enrollment

from .models import Course, Lesson, LessonProgress
from .serializers import (
    CourseSerializer,
    LessonSerializer,
    LessonProgressSerializer,
)


# ==================================================
# COURSE LIST AND CREATE API
# GET  /api/courses/       -> Anyone can view courses
# POST /api/courses/       -> Instructors can create courses
# ==================================================

class CourseListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Allow everyone to browse available courses.
        if self.request.method in ["GET", "HEAD", "OPTIONS"]:
            return [AllowAny()]

        # Creating courses requires authentication.
        return [IsAuthenticated()]

    def get(self, request):
        courses = Course.objects.all().order_by("id")

        serializer = CourseSerializer(
            courses,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        # Only instructors can create courses.
        if request.user.profile.user_type != "instructor":
            return Response(
                {
                    "error": "Only instructors can create courses."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseSerializer(data=request.data)

        if serializer.is_valid():
            course = serializer.save(instructor=request.user)

            return Response(
                CourseSerializer(course).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ==================================================
# COURSE DETAIL, UPDATE, AND DELETE API
# GET    /api/courses/<course_id>/ -> Anyone can view
# PUT    /api/courses/<course_id>/ -> Instructor only
# PATCH  /api/courses/<course_id>/ -> Instructor only
# DELETE /api/courses/<course_id>/ -> Instructor only
# ==================================================

class CourseDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Anyone can view course details.
        if self.request.method in ["GET", "HEAD", "OPTIONS"]:
            return [AllowAny()]

        # Updating or deleting requires authentication.
        return [IsAuthenticated()]

    def get_course(self, course_id):
        try:
            return Course.objects.select_related(
                "instructor"
            ).get(id=course_id)

        except Course.DoesNotExist:
            return None

    def get(self, request, course_id):
        course = self.get_course(course_id)

        if course is None:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CourseSerializer(course)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, course_id):
        course = self.get_course(course_id)

        if course is None:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Instructors can update only their own courses.
        if course.instructor != request.user:
            return Response(
                {
                    "error": "You can update only your own courses."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseSerializer(
            course,
            data=request.data,
        )

        if serializer.is_valid():
            updated_course = serializer.save(
                instructor=request.user,
            )

            return Response(
                CourseSerializer(updated_course).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, course_id):
        course = self.get_course(course_id)

        if course is None:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Instructors can update only their own courses.
        if course.instructor != request.user:
            return Response(
                {
                    "error": "You can update only your own courses."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseSerializer(
            course,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            updated_course = serializer.save(
                instructor=request.user,
            )

            return Response(
                CourseSerializer(updated_course).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, course_id):
        course = self.get_course(course_id)

        if course is None:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Instructors can delete only their own courses.
        if course.instructor != request.user:
            return Response(
                {
                    "error": "You can delete only your own courses."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        course.delete()

        return Response(
            {
                "message": "Course deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


# ==================================================
# LESSON LIST AND CREATE API
# GET  /api/lessons/?course=<course_id>
# POST /api/lessons/
# ==================================================

class LessonListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        course_id = request.query_params.get("course")

        if course_id:
            lessons = Lesson.objects.filter(
                course_id=course_id
            ).order_by("order", "id")
        else:
            lessons = Lesson.objects.all().order_by(
                "course_id",
                "order",
                "id",
            )

        serializer = LessonSerializer(
            lessons,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        # Only instructors can create lessons.
        if request.user.profile.user_type != "instructor":
            return Response(
                {
                    "error": "Only instructors can create lessons."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        course_id = request.data.get("course")

        if not course_id:
            return Response(
                {"error": "Course ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            course = Course.objects.get(id=course_id)

        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Instructors can add lessons only to their own courses.
        if course.instructor != request.user:
            return Response(
                {
                    "error": (
                        "You can create lessons only for your own courses."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = LessonSerializer(data=request.data)

        if serializer.is_valid():
            lesson = serializer.save(course=course)

            return Response(
                LessonSerializer(lesson).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ==================================================
# LESSON DETAIL, UPDATE, AND DELETE API
# GET    /api/lessons/<lesson_id>/
# PUT    /api/lessons/<lesson_id>/
# PATCH  /api/lessons/<lesson_id>/
# DELETE /api/lessons/<lesson_id>/
# ==================================================

class LessonDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_lesson(self, lesson_id):
        try:
            return Lesson.objects.select_related(
                "course",
                "course__instructor",
            ).get(id=lesson_id)

        except Lesson.DoesNotExist:
            return None

    def get(self, request, lesson_id):
        lesson = self.get_lesson(lesson_id)

        if lesson is None:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LessonSerializer(lesson)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, lesson_id):
        lesson = self.get_lesson(lesson_id)

        if lesson is None:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the course's instructor can update the lesson.
        if lesson.course.instructor != request.user:
            return Response(
                {
                    "error": "You can update only your own lessons."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = LessonSerializer(
            lesson,
            data=request.data,
        )

        if serializer.is_valid():
            updated_lesson = serializer.save(
                course=lesson.course,
            )

            return Response(
                LessonSerializer(updated_lesson).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, lesson_id):
        lesson = self.get_lesson(lesson_id)

        if lesson is None:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the course's instructor can update the lesson.
        if lesson.course.instructor != request.user:
            return Response(
                {
                    "error": "You can update only your own lessons."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = LessonSerializer(
            lesson,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            updated_lesson = serializer.save(
                course=lesson.course,
            )

            return Response(
                LessonSerializer(updated_lesson).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, lesson_id):
        lesson = self.get_lesson(lesson_id)

        if lesson is None:
            return Response(
                {"error": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the course's instructor can delete the lesson.
        if lesson.course.instructor != request.user:
            return Response(
                {
                    "error": "You can delete only your own lessons."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        lesson.delete()

        return Response(
            {
                "message": "Lesson deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


# ==================================================
# LESSON PROGRESS API
# GET  /api/lesson-progress/
# POST /api/lesson-progress/
# ==================================================

class LessonProgressView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return only the logged-in user's lesson progress.
        progress = LessonProgress.objects.filter(
            student=request.user,
        ).select_related(
            "lesson",
            "lesson__course",
        ).order_by(
            "lesson__course_id",
            "lesson__order",
        )

        serializer = LessonProgressSerializer(
            progress,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        lesson_id = request.data.get("lesson")

        if not lesson_id:
            return Response(
                {"message": "Lesson ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            lesson = Lesson.objects.select_related(
                "course",
            ).get(id=lesson_id)

        except (Lesson.DoesNotExist, ValueError, TypeError):
            return Response(
                {"message": "Lesson not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # A student must be actively enrolled to complete a lesson.
        is_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=lesson.course,
            status="active",
        ).exists()

        if not is_enrolled:
            return Response(
                {
                    "message": (
                        "You must be enrolled in this course "
                        "to complete lessons."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        progress, created = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson,
        )

        # Do not reset the completion timestamp if already completed.
        if not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save(
                update_fields=["completed", "completed_at"],
            )

        serializer = LessonProgressSerializer(progress)

        response_status = (
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )

        return Response(
            serializer.data,
            status=response_status,
        )