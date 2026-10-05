from django import forms

from .models import ContactMessage


class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ("name", "email", "message")
        widgets = {
            "name": forms.TextInput(
                attrs={
                    "class": "checkin-input",
                    "placeholder": "Your name",
                    "autocomplete": "name",
                }
            ),
            "email": forms.EmailInput(
                attrs={
                    "class": "checkin-input",
                    "placeholder": "you@college.edu",
                    "autocomplete": "email",
                }
            ),
            "message": forms.Textarea(
                attrs={
                    "class": "checkin-input checkin-note",
                    "placeholder": "How can we help?",
                    "rows": 5,
                }
            ),
        }
