from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, ChatMessageSerializer


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(owner=self.request.user).prefetch_related("messages")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Conversation.objects.filter(owner=self.request.user).prefetch_related("messages")


class ConversationMessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_conversation(self, request, conversation_id):
        return get_object_or_404(Conversation, id=conversation_id, owner=request.user)

    def get(self, request, conversation_id):
        conversation = self.get_conversation(request, conversation_id)
        messages = conversation.messages.all()
        return Response(ChatMessageSerializer(messages, many=True).data)

    @transaction.atomic
    def post(self, request, conversation_id):
        conversation = self.get_conversation(request, conversation_id)
        role = request.data.get("role")
        content = request.data.get("content")
        if role not in {ChatMessage.USER, ChatMessage.ASSISTANT}:
            return Response({"error": "role must be 'user' or 'assistant'."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(content, str) or not content.strip():
            return Response({"error": "content is required."}, status=status.HTTP_400_BAD_REQUEST)
        message = ChatMessage.objects.create(conversation=conversation, role=role, content=content.strip())
        if role == ChatMessage.USER and conversation.title == "New conversation":
            conversation.title = content.strip().splitlines()[0][:42] or "New conversation"
        conversation.save(update_fields=["title", "updated_at"])
        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)

    def delete(self, request, conversation_id):
        conversation = self.get_conversation(request, conversation_id)
        conversation.messages.all().delete()
        conversation.title = "New conversation"
        conversation.save(update_fields=["title", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
