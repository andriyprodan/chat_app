from django.contrib.auth import get_user_model
from rest_framework import serializers
from chat.models import ChatRoom, ChatMessage
from user.serializers import UserSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

class ChatRoomSerializer(serializers.ModelSerializer):
    member = UserSerializer(many=True, read_only=True)
    # members = serializers.ListField(write_only=True)

    class Meta:
        model = ChatRoom
        exclude = ['id']


class CreateChatRoomSerializer(serializers.ModelSerializer):
    start_with = serializers.IntegerField()
    creator = serializers.IntegerField()

    def create(self, validatedData):
        start_with = validatedData.pop('start_with')
        sw_user = User.objects.get(pk=start_with)
        creator = User.objects.get(pk=validatedData.pop('creator'))
        chatRoom = ChatRoom.objects.create(**validatedData)
        chatRoom.member.set([sw_user, creator])
        return chatRoom

    class Meta:
        model = ChatRoom
        exclude = ('member',)



class ChatMessageSerializer(serializers.ModelSerializer):
    userName = serializers.SerializerMethodField()
    userImage = serializers.ImageField(source='user.image')

    class Meta:
        model = ChatMessage
        exclude = ['id', 'chat']

    def get_userName(self, Obj):
        return Obj.user.first_name + ' ' + Obj.user.last_name
