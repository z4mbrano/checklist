from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ClientBase(BaseModel):
    name: str = Field(alias="nome")
    cnpj: str
    phone: Optional[str] = Field(None, alias="telefone")
    email: Optional[str] = None
    address: Optional[str] = Field(None, alias="endereco")
    city: str = Field(alias="cidade")
    state: str = Field(alias="estado")
    zip_code: Optional[str] = Field(None, alias="cep")

    class Config:
        populate_by_name = True
        from_attributes = True

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, alias="nome")
    cnpj: Optional[str] = None
    city: Optional[str] = Field(None, alias="cidade")
    state: Optional[str] = Field(None, alias="estado")

    class Config:
        populate_by_name = True

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
