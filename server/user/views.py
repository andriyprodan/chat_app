from django.db.models import Subquery
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import AllowAny
from user.models import User
from user.serializers import (
	UserSerializer, LoginSerializer, SignupSerializer
)

from chat.models import ChatRoom


class UserView(ListAPIView):
	queryset = User.objects.all().order_by('first_name')
	serializer_class = UserSerializer
	pagination_class = LimitOffsetPagination

	def get_queryset(self):
		common_rooms = ChatRoom.objects.filter(type='DM', member__id=self.request.user.id)
		return super().get_queryset().exclude(chat_rooms__id__in=Subquery(common_rooms.values('id')))

	def get(self, request, *args, **kwargs):
		resp = super().get(request, *args, **kwargs)
		return resp


class LoginApiView(TokenObtainPairView):
	permission_classes = [AllowAny]
	serializer_class = LoginSerializer

	def post(self, request, *args, **kwargs):
		resp = super().post(request, *args, **kwargs)
		return resp


class SignupApiView(CreateAPIView):
	permission_classes = [AllowAny]
	queryset = User.objects.all()
	serializer_class = SignupSerializer
