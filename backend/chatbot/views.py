import logging

from django.conf import settings

from google import genai

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


logger = logging.getLogger(__name__)


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get the student's question.
        question = request.data.get("message", "")

        # Validate the message.
        if not isinstance(question, str) or not question.strip():
            return Response(
                {"error": "Please enter a question."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        question = question.strip()

        # Check whether the Gemini API key is configured.
        api_key = getattr(settings, "GEMINI_API_KEY", None)

        if not api_key:
            logger.error("GEMINI_API_KEY is not configured.")

            return Response(
                {"error": "The AI assistant is not configured yet."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            # Create the Gemini client.
            client = genai.Client(api_key=api_key)

            # Send the student's question to Gemini.
            response = client.models.generate_content(
                model="models/gemini-3.5-flash",
                contents=(
                    "You are Learnova AI, a friendly educational assistant. "
                    "Help students understand academic and programming "
                    "topics in simple language. Explain difficult concepts "
                    "step by step and provide examples when useful. "
                    "For programming questions, include code examples "
                    "when appropriate. If you do not know an answer, "
                    "be honest rather than inventing information.\n\n"
                    f"Student's question: {question}"
                ),
            )

            # Extract the generated answer.
            answer = response.text

            if not answer or not answer.strip():
                logger.warning(
                    "Gemini returned an empty answer for a chatbot request."
                )

                return Response(
                    {
                        "error": (
                            "The AI did not generate an answer. "
                            "Please try another question."
                        )
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            # Return the question and answer to the frontend.
            return Response(
                {
                    "question": question,
                    "answer": answer.strip(),
                },
                status=status.HTTP_200_OK,
            )

        except Exception:
            # Log the traceback in the Django terminal.
            # Do not expose internal details or secrets to the client.
            logger.exception("Learnova Gemini API request failed.")

            return Response(
                {
                    "error": (
                        "Unable to get an answer from Learnova AI right now. "
                        "Please try again later."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )