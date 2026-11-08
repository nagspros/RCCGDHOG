from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, field_validator

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
