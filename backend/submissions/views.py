from django.conf import settings
from django.http import JsonResponse
from django.db.models import Count, OuterRef, Prefetch, Subquery
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from submissions import models, serializers as submission_serializers
from submissions.filters.submission import SubmissionFilterSet


class ReviewerSessionPermission(permissions.BasePermission):
    message = "Login required."

    def has_permission(self, request, _view):
        return bool(request.session.get("reviewer_authenticated"))


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255)


def _build_session_payload(request):
    if not request.session.get("reviewer_authenticated"):
        return {"authenticated": False, "user": None}

    return {
        "authenticated": True,
        "user": {
            "username": request.session.get("reviewer_username", settings.REVIEWER_LOGIN_USERNAME),
            "display_name": request.session.get("reviewer_display_name", settings.REVIEWER_LOGIN_NAME),
        },
    }


def healthcheck(_request):
    return JsonResponse({"status": "ok"})


@csrf_exempt
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data["username"].strip()
    password = serializer.validated_data["password"]

    if (
        username != settings.REVIEWER_LOGIN_USERNAME
        or password != settings.REVIEWER_LOGIN_PASSWORD
    ):
        return Response(
            {"detail": "Invalid login credentials."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    request.session.cycle_key()
    request.session["reviewer_authenticated"] = True
    request.session["reviewer_username"] = settings.REVIEWER_LOGIN_USERNAME
    request.session["reviewer_display_name"] = settings.REVIEWER_LOGIN_NAME
    request.session.modified = True
    return Response(_build_session_payload(request))


@csrf_exempt
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def logout_view(request):
    request.session.flush()
    return Response({"authenticated": False, "user": None})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def session_view(request):
    return Response(_build_session_payload(request))


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Submission.objects.all()
    filterset_class = SubmissionFilterSet
    permission_classes = [ReviewerSessionPermission]

    def get_queryset(self):
        queryset = (
            super()
            .get_queryset()
            .select_related("broker", "company", "owner")
            .order_by("-created_at", "-id")
        )

        if self.action == "list":
            latest_note = models.Note.objects.filter(submission_id=OuterRef("pk")).order_by("-created_at")
            queryset = queryset.annotate(
                document_count=Count("documents", distinct=True),
                note_count=Count("notes", distinct=True),
                latest_note_author=Subquery(latest_note.values("author_name")[:1]),
                latest_note_body=Subquery(latest_note.values("body")[:1]),
                latest_note_created_at=Subquery(latest_note.values("created_at")[:1]),
            )
        else:
            queryset = queryset.prefetch_related(
                "contacts",
                "documents",
                Prefetch("notes", queryset=models.Note.objects.order_by("-created_at")),
            )

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return submission_serializers.SubmissionListSerializer
        return submission_serializers.SubmissionDetailSerializer


class BrokerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Broker.objects.all()
    serializer_class = submission_serializers.BrokerSerializer
    permission_classes = [ReviewerSessionPermission]
