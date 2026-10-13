from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RegisterSerializer,LoginSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class RegisterView(APIView):
    def post(self,request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message":"Registration successful"
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            return Response(
                {
                    "message": "Login successful",

                    "user": {
                        "username": serializer.validated_data['user'].username,
                        "email": serializer.validated_data['user'].email,
                        "user_type": serializer.validated_data['user'].profile.user_type,
                    },

                    "refresh": serializer.validated_data['refresh'],
                    "access": serializer.validated_data['access']
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "username": user.username,
            "email": user.email,
            "user_type": user.profile.user_type
        })

    def patch(self, request):
        user = request.user

        email = request.data.get("email")

        if email is None:
            return Response(
                {"message": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = email.strip()

        if not email:
            return Response(
                {"message": "Email cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if "@" not in email or "." not in email.split("@")[-1]:
            return Response(
                {"message": "Enter a valid email address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.email = email
        user.save(update_fields=["email"])

        return Response({
            "message": "Profile updated successfully.",
            "username": user.username,
            "email": user.email,
            "user_type": user.profile.user_type
        })