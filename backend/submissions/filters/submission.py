import django_filters
from django.db.models import Count, Q

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    priority = django_filters.CharFilter(field_name="priority", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(method="filter_company_search")
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")
    createdFrom = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="gte")
    createdTo = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = models.Submission
        fields = [
            "status",
            "priority",
            "brokerId",
            "companySearch",
            "hasDocuments",
            "hasNotes",
            "createdFrom",
            "createdTo",
        ]

    def filter_company_search(self, queryset, name, value):
        if not value:
            return queryset

        return queryset.filter(
            Q(company__legal_name__icontains=value)
            | Q(company__industry__icontains=value)
            | Q(company__headquarters_city__icontains=value)
        )

    def filter_has_documents(self, queryset, name, value):
        queryset = queryset.annotate(filter_document_count=Count("documents", distinct=True))
        if value:
            return queryset.filter(filter_document_count__gt=0)
        return queryset.filter(filter_document_count=0)

    def filter_has_notes(self, queryset, name, value):
        queryset = queryset.annotate(filter_note_count=Count("notes", distinct=True))
        if value:
            return queryset.filter(filter_note_count__gt=0)
        return queryset.filter(filter_note_count=0)

