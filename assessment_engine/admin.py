from django.contrib import admin
from .models import MCQQuestion,AssessmentResult,AssessmentAttempt,Domain,Topic,TopicScore

admin.site.register(MCQQuestion)
admin.site.register(AssessmentResult)
admin.site.register(AssessmentAttempt)
admin.site.register(Domain)
admin.site.register(Topic)
admin.site.register(TopicScore)







# Register your models here.
