import uuid

from pydantic import EmailStr
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=6, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=6, max_length=40)


class UserUpdateMe(UserBase):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=6, max_length=40)
    new_password: str = Field(min_length=6, max_length=40)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    detect_histories: list["DetectHistory"] = Relationship(back_populates="owner", cascade_delete=True)


class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class DetectHistoryBase(SQLModel):
    raw_image: str
    annotated_image: str
    timestamp: str
    detections: str
    
class DetectHistoryCreate(DetectHistoryBase):
    pass
    
class DetectHistory(DetectHistoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="detect_histories")
    
class DetectHistoryPublic(SQLModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    raw_image_url: str
    annotated_image_url: str
    timestamp: str
    detections: str

class DetectHistoriesPublic(SQLModel):
    data: list[DetectHistoryPublic]
    count: int
    

class Message(SQLModel):
    message: str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenPayload(SQLModel):
    sub: str | None = None
    
class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=6, max_length=40)
    
class MinioBucket(Enum):
    UPLOAD: str = "upload"
    ANNOTATED: str = "annotated"