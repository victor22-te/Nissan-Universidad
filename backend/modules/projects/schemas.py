"""
Esquemas Pydantic para el módulo de Gestión de Proyectos.
"""
from pydantic import BaseModel
from typing import Optional, List, Any


class BoardCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#3b82f6"


class BoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class GroupCreate(BaseModel):
    board_id: int
    name: str
    color: Optional[str] = "#3b82f6"


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    collapsed: Optional[bool] = None
    position: Optional[int] = None


class ColumnCreate(BaseModel):
    board_id: int
    title: str
    column_type: str
    settings: Optional[dict] = None
    width: Optional[int] = 150


class ColumnUpdate(BaseModel):
    title: Optional[str] = None
    settings: Optional[dict] = None
    width: Optional[int] = None
    position: Optional[int] = None


class ItemCreate(BaseModel):
    group_id: int
    name: str
    column_values: Optional[dict] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    column_values: Optional[dict] = None
    position: Optional[int] = None


class SubItemCreate(BaseModel):
    item_id: int
    name: str
    column_values: Optional[dict] = None


class SubItemUpdate(BaseModel):
    name: Optional[str] = None
    column_values: Optional[dict] = None
    position: Optional[int] = None
