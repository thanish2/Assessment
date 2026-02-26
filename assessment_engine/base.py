

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .utils import sync_user_from_token

class AuthenticatedAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        self.synced_user = sync_user_from_token(request)
