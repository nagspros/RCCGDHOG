from datetime import date, datetime
from math import isfinite
from typing import Annotated, Literal
from urllib.parse import urlsplit
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, TypeAdapter, ValidationError, field_validator, model_validator

Short = Annotated[str, StringConstraints(strip_whitespace=True, max_length=250)]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]
Message = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=12000)]


class Form(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Contact(Form):
    name: Name
    email: EmailStr
    phone: Short = ""
    subject: Short
    message: Message


class Prayer(Form):
    name: Name
    email: EmailStr | Literal[""] = ""
    phone: Short = ""
    category: Literal["Healing & Health", "Family & Marriage", "Spiritual Growth", "Financial Breakthrough", "Theological / Doctrine", "Thanksgiving"]
    subjectOrTopic: Short
    message: Message
    isConfidentialToPastorOnly: bool = False
    urgency: Literal["Standard", "Urgent", "Thanksgiving"] = "Standard"
    wantsCall: bool = False
    preferredContact: Short = ""


class AskPastor(Form):
    name: Name
    email: EmailStr
    phone: Short = ""
    topic: Short
    message: Message


class Connect(Form):
    formType: Literal["Newcomer", "Membership", "Water Baptism", "Workers in Training (WIT)"]
    fullName: Name
    email: EmailStr
    phone: Short = ""
    address: Short = ""
    notes: Annotated[str, StringConstraints(max_length=12000)] = ""
    subscribe: bool = False
    waterBaptized: Short = ""


class Visit(Form):
    name: Name
    email: EmailStr
    phone: Short = ""
    serviceDate: Short
    guests: Short = ""
    specialNeeds: Annotated[str, StringConstraints(max_length=12000)] = ""


class Ride(Form):
    name: Name
    phone: Name
    email: EmailStr | Literal[""] = ""
    address: Name
    passengers: Short = ""
    service: Short
    notes: Annotated[str, StringConstraints(max_length=12000)] = ""


class Ministry(Form):
    name: Name
    email: EmailStr
    phone: Short = ""
    ministry: Name
    message: Annotated[str, StringConstraints(max_length=12000)] = ""


class Member(Form):
    name: Name
    email: EmailStr
    phone: Short = ""
    status: Literal["pending", "active", "inactive"] = "active"
    subscribed: bool = False


class MemberUpdate(Form):
    name: Name
    phone: Short = ""
    status: Literal["pending", "active", "inactive"]
    subscribed: bool


class MemberImport(Form):
    csv: str = Field(min_length=1, max_length=500000)


class SiteUpdate(Form):
    version: int = Field(ge=1)
    data: dict


Id = Annotated[str, StringConstraints(min_length=1, max_length=255)]
SiteURL = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2048)]
gallery_email = TypeAdapter(EmailStr)


def site_url(value, *, fragment=False):
    if any(char.isspace() or ord(char) < 32 or char == "\\" for char in value):
        raise ValueError("Enter a site path or an HTTPS URL.")
    if value.startswith("/") and not value.startswith("//"):
        return value
    if fragment and value.startswith("#") and len(value) > 1:
        return value
    parsed = urlsplit(value)
    if parsed.scheme == "https" and parsed.hostname and parsed.username is None:
        return value
    raise ValueError("Enter a site path or an HTTPS URL.")


class SiteLink(Form):
    label: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]
    url: SiteURL

    @field_validator("url")
    @classmethod
    def validate_url(cls, value):
        return site_url(value, fragment=True)


class HeroSlide(Form):
    id: Id
    title: Annotated[str, StringConstraints(strip_whitespace=True, max_length=100)] = ""
    subtitle: Annotated[str, StringConstraints(strip_whitespace=True, max_length=250)] = ""
    imageSrc: SiteURL
    videoSrc: Annotated[str, StringConstraints(strip_whitespace=True, max_length=2048)] = ""
    showText: bool = Field(default_factory=lambda fields: bool(fields["videoSrc"]))
    imageFit: Literal["contain", "cover"] = "cover"
    primaryButton: SiteLink
    secondaryButton: SiteLink
    published: bool

    @model_validator(mode="after")
    def title_required_for_text_overlay(self):
        if self.showText and not self.title:
            raise ValueError("Enter a slide title or turn off overlay text.")
        return self

    @field_validator("imageSrc", "videoSrc")
    @classmethod
    def validate_media(cls, value):
        return site_url(value) if value else value


class GalleryField(Form):
    id: UUID
    label: Name
    kind: Literal["text", "textarea", "email", "tel", "number", "date", "select", "radio", "checkbox"]
    required: bool = False
    options: list[Name] = Field(default_factory=list, max_length=30)

    @model_validator(mode="after")
    def validate_options(self):
        choices = self.kind in {"select", "radio"}
        if choices and (len(self.options) < 2 or len(set(self.options)) != len(self.options)):
            raise ValueError("Choice fields need at least two distinct options.")
        if not choices and self.options:
            raise ValueError("Options are only supported for dropdown and radio fields.")
        return self


class GalleryForm(Form):
    title: Name
    description: Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)] = ""
    submitLabel: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]
    fields: list[GalleryField] = Field(min_length=1, max_length=30)
    revision: UUID | None = None

    @model_validator(mode="after")
    def unique_fields(self):
        if len({field.id for field in self.fields}) != len(self.fields):
            raise ValueError("Form fields must have distinct IDs.")
        return self


class GalleryEngagement(Form):
    published: bool
    links: list[SiteLink] = Field(max_length=8)
    form: GalleryForm | None = None


class GalleryAnswers(Form):
    revision: UUID
    answers: dict[UUID, Annotated[str, StringConstraints(max_length=4000)] | bool] = Field(max_length=30)


def valid_gallery_value(field, value):
    if field.kind == "checkbox":
        return type(value) is bool and (value or not field.required)
    if not isinstance(value, str):
        return False
    if not value:
        return not field.required
    if field.kind in {"select", "radio"}:
        return value in field.options
    if field.kind == "date":
        try:
            return date.fromisoformat(value).isoformat() == value
        except ValueError:
            return False
    if field.kind == "number":
        try:
            return isfinite(float(value))
        except ValueError:
            return False
    if field.kind == "email":
        try:
            gallery_email.validate_python(value)
        except ValidationError:
            return False
    return True


class SubmissionUpdate(Form):
    status: Literal["New", "In progress", "Closed"]


class Campaign(Form):
    id: UUID
    audience: Literal["member", "all"]
    memberId: UUID | None = None
    subject: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=180, pattern=r"^[^\r\n]+$")]
    body: Message
    eventId: Short | None = None
    sendAt: datetime | None = None

    @field_validator("sendAt")
    @classmethod
    def timezone_required(cls, value):
        if value is not None and value.utcoffset() is None:
            raise ValueError("Send time must include a timezone.")
        return value
