"""
Rutas del módulo de Gestión de Proyectos (estilo Monday).
Maneja tableros, grupos, items, sub-items y columnas.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, subqueryload
from sqlalchemy.orm.attributes import flag_modified
from database import get_db
from models import ProjectBoard, ProjectGroup, ProjectItem, ProjectSubItem, ProjectColumn
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

router = APIRouter(prefix="/api/projects", tags=["Projects"])


from .schemas import (
    BoardCreate,
    BoardUpdate,
    GroupCreate,
    GroupUpdate,
    ColumnCreate,
    ColumnUpdate,
    ItemCreate,
    ItemUpdate,
    SubItemCreate,
    SubItemUpdate,
)


# ── Helpers ──────────────────────────────────────────────────

def _buscar_o_404(db: Session, modelo, registro_id: int, mensaje_404: str):
    """Busca un registro por ID o lanza HTTP 404 con el mensaje proporcionado."""
    registro = db.query(modelo).filter(modelo.id == registro_id).first()
    if not registro:
        raise HTTPException(404, mensaje_404)
    return registro


def _siguiente_posicion(db: Session, modelo, filtro_campo, filtro_valor) -> int:
    """Calcula la siguiente posición disponible contando los registros existentes."""
    return db.query(modelo).filter(filtro_campo == filtro_valor).count()


def _aplicar_actualizacion_parcial(registro, datos: BaseModel, campos_permitidos: list = None):
    """Aplica solo los campos no-None del schema al registro ORM."""
    datos_dict = datos.model_dump(exclude_unset=True) if hasattr(datos, 'model_dump') else {}
    for campo, valor in datos_dict.items():
        if valor is not None and (campos_permitidos is None or campo in campos_permitidos):
            setattr(registro, campo, valor)


def _merge_column_values(registro, nuevos_valores: dict):
    """Fusiona nuevos column_values con los existentes, marcando el atributo como modificado."""
    valores_actuales = dict(registro.column_values or {})
    valores_actuales.update(nuevos_valores)
    registro.column_values = valores_actuales
    flag_modified(registro, 'column_values')


def _serializar_tablero(board, columns, groups_data) -> dict:
    """Serializa un tablero completo con sus columnas y grupos para la respuesta JSON."""
    return {
        "id": board.id, "name": board.name, "description": board.description,
        "color": board.color, "created_at": board.created_at.isoformat(),
        "columns": [{
            "id": columna.id, "title": columna.title, "column_type": columna.column_type,
            "settings": columna.settings or {}, "width": columna.width, "position": columna.position,
        } for columna in columns],
        "groups": groups_data,
    }


def _serializar_item(item) -> dict:
    """Serializa un ProjectItem con sus subitems."""
    return {
        "id": item.id, "name": item.name,
        "column_values": item.column_values or {},
        "position": item.position,
        "subitems": [{
            "id": subitem.id, "name": subitem.name,
            "column_values": subitem.column_values or {},
            "position": subitem.position,
        } for subitem in (item.subitems or [])],
    }


def _serializar_grupo(grupo) -> dict:
    """Serializa un ProjectGroup con sus items."""
    return {
        "id": grupo.id, "name": grupo.name, "color": grupo.color,
        "collapsed": grupo.collapsed, "position": grupo.position,
        "items": [_serializar_item(item) for item in (grupo.items or [])],
    }


# ── Configuración por defecto de columnas ────────────────────

_COLUMN_DEFAULT_SETTINGS = {
    "status": {
        "labels": {
            "Pendiente": "#737373",
            "En progreso": "#3b82f6",
            "Completado": "#10b981",
            "Detenido": "#f59e0b",
            "Cancelado": "#ef4444",
        }
    },
    "priority": {
        "labels": {
            "Urgente": "#ef4444",
            "Alta": "#f59e0b",
            "Media": "#3b82f6",
            "Baja": "#737373",
        }
    },
    "dropdown": {
        "options": ["Opcion 1", "Opcion 2", "Opcion 3"]
    },
    "rating": {"max": 5},
}


def _obtener_settings_por_defecto(tipo_columna: str) -> dict:
    """Retorna la configuración por defecto para un tipo de columna dado."""
    return _COLUMN_DEFAULT_SETTINGS.get(tipo_columna, {})


# ── Boards ───────────────────────────────────────────────────

@router.get("/boards")
def listar_tableros(db: Session = Depends(get_db)):
    """Lista todos los tableros con conteos resumidos de grupos e items."""
    tableros = db.query(ProjectBoard).order_by(ProjectBoard.created_at.desc()).all()
    return [{
        "id": tablero.id, "name": tablero.name, "description": tablero.description,
        "color": tablero.color, "created_at": tablero.created_at.isoformat(),
        "groups_count": len(tablero.groups),
        "items_count": sum(len(grupo.items) for grupo in tablero.groups),
    } for tablero in tableros]


@router.post("/boards")
def crear_tablero(data: BoardCreate, db: Session = Depends(get_db)):
    """Crea un tablero nuevo con un grupo por defecto."""
    tablero = ProjectBoard(name=data.name, description=data.description, color=data.color)
    db.add(tablero)
    db.commit()
    db.refresh(tablero)

    grupo_inicial = ProjectGroup(board_id=tablero.id, name="Nuevo grupo", color=data.color, position=0)
    db.add(grupo_inicial)
    db.commit()
    return {"id": tablero.id, "name": tablero.name}


@router.get("/boards/{board_id}")
def obtener_tablero(board_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un tablero completo con columnas, grupos, items y subitems.
    Usa eager loading para evitar el problema N+1.
    """
    tablero = (
        db.query(ProjectBoard)
        .options(
            subqueryload(ProjectBoard.columns),
            subqueryload(ProjectBoard.groups)
                .subqueryload(ProjectGroup.items)
                .subqueryload(ProjectItem.subitems),
        )
        .filter(ProjectBoard.id == board_id)
        .first()
    )
    if not tablero:
        raise HTTPException(404, "Tablero no encontrado")

    columnas = sorted(tablero.columns, key=lambda c: c.position)
    grupos = sorted(tablero.groups, key=lambda g: g.position)

    datos_grupos = []
    for grupo in grupos:
        items_ordenados = sorted(grupo.items or [], key=lambda i: i.position)
        # Ordenar subitems dentro de cada item
        for item in items_ordenados:
            item.subitems = sorted(item.subitems or [], key=lambda si: si.position)
        grupo.items = items_ordenados
        datos_grupos.append(_serializar_grupo(grupo))

    return _serializar_tablero(tablero, columnas, datos_grupos)


@router.put("/boards/{board_id}")
def actualizar_tablero(board_id: int, data: BoardUpdate, db: Session = Depends(get_db)):
    """Actualiza nombre, descripción o color de un tablero."""
    tablero = _buscar_o_404(db, ProjectBoard, board_id, "Tablero no encontrado")
    _aplicar_actualizacion_parcial(tablero, data)
    db.commit()
    return {"ok": True}


@router.delete("/boards/{board_id}")
def eliminar_tablero(board_id: int, db: Session = Depends(get_db)):
    """Elimina un tablero y todo su contenido en cascada."""
    tablero = _buscar_o_404(db, ProjectBoard, board_id, "Tablero no encontrado")
    db.delete(tablero)
    db.commit()
    return {"ok": True}


# ── Groups ───────────────────────────────────────────────────

@router.post("/groups")
def crear_grupo(data: GroupCreate, db: Session = Depends(get_db)):
    """Crea un grupo nuevo al final del tablero."""
    posicion = _siguiente_posicion(db, ProjectGroup, ProjectGroup.board_id, data.board_id)
    grupo = ProjectGroup(
        board_id=data.board_id, name=data.name, color=data.color, position=posicion
    )
    db.add(grupo)
    db.commit()
    db.refresh(grupo)
    return {"id": grupo.id, "name": grupo.name}


@router.put("/groups/{group_id}")
def actualizar_grupo(group_id: int, data: GroupUpdate, db: Session = Depends(get_db)):
    """Actualiza propiedades de un grupo (nombre, color, colapsado, posición)."""
    grupo = _buscar_o_404(db, ProjectGroup, group_id, "Grupo no encontrado")
    _aplicar_actualizacion_parcial(grupo, data)
    db.commit()
    return {"ok": True}


@router.delete("/groups/{group_id}")
def eliminar_grupo(group_id: int, db: Session = Depends(get_db)):
    """Elimina un grupo y todos sus items en cascada."""
    grupo = _buscar_o_404(db, ProjectGroup, group_id, "Grupo no encontrado")
    db.delete(grupo)
    db.commit()
    return {"ok": True}


# ── Columns ──────────────────────────────────────────────────

@router.post("/columns")
def crear_columna(data: ColumnCreate, db: Session = Depends(get_db)):
    """Crea una columna nueva con settings por defecto según su tipo."""
    posicion = _siguiente_posicion(db, ProjectColumn, ProjectColumn.board_id, data.board_id)

    settings_por_defecto = _obtener_settings_por_defecto(data.column_type)
    settings_finales = {**settings_por_defecto, **(data.settings or {})}

    columna = ProjectColumn(
        board_id=data.board_id, title=data.title, column_type=data.column_type,
        settings=settings_finales, width=data.width or 150, position=posicion
    )
    db.add(columna)
    db.commit()
    db.refresh(columna)
    return {"id": columna.id, "title": columna.title, "column_type": columna.column_type}


@router.put("/columns/{column_id}")
def actualizar_columna(column_id: int, data: ColumnUpdate, db: Session = Depends(get_db)):
    """Actualiza título, settings, ancho o posición de una columna."""
    columna = _buscar_o_404(db, ProjectColumn, column_id, "Columna no encontrada")
    _aplicar_actualizacion_parcial(columna, data)
    db.commit()
    return {"ok": True}


@router.delete("/columns/{column_id}")
def eliminar_columna(column_id: int, db: Session = Depends(get_db)):
    """Elimina una columna del tablero."""
    columna = _buscar_o_404(db, ProjectColumn, column_id, "Columna no encontrada")
    db.delete(columna)
    db.commit()
    return {"ok": True}


# ── Items ────────────────────────────────────────────────────

@router.post("/items")
def crear_item(data: ItemCreate, db: Session = Depends(get_db)):
    """Crea un item nuevo al final de un grupo."""
    posicion = _siguiente_posicion(db, ProjectItem, ProjectItem.group_id, data.group_id)
    item = ProjectItem(
        group_id=data.group_id, name=data.name,
        column_values=data.column_values or {}, position=posicion
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name}


@router.put("/items/{item_id}")
def actualizar_item(item_id: int, data: ItemUpdate, db: Session = Depends(get_db)):
    """Actualiza nombre, valores de columna o posición de un item."""
    item = _buscar_o_404(db, ProjectItem, item_id, "Item no encontrado")
    if data.name is not None:
        item.name = data.name
    if data.column_values is not None:
        _merge_column_values(item, data.column_values)
    if data.position is not None:
        item.position = data.position
    db.commit()
    return {"ok": True}


@router.delete("/items/{item_id}")
def eliminar_item(item_id: int, db: Session = Depends(get_db)):
    """Elimina un item y sus subitems en cascada."""
    item = _buscar_o_404(db, ProjectItem, item_id, "Item no encontrado")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ── Sub-Items ────────────────────────────────────────────────

@router.post("/subitems")
def crear_subitem(data: SubItemCreate, db: Session = Depends(get_db)):
    """Crea un sub-item nuevo al final de un item."""
    posicion = _siguiente_posicion(db, ProjectSubItem, ProjectSubItem.item_id, data.item_id)
    subitem = ProjectSubItem(
        item_id=data.item_id, name=data.name,
        column_values=data.column_values or {}, position=posicion
    )
    db.add(subitem)
    db.commit()
    db.refresh(subitem)
    return {"id": subitem.id, "name": subitem.name}


@router.put("/subitems/{subitem_id}")
def actualizar_subitem(subitem_id: int, data: SubItemUpdate, db: Session = Depends(get_db)):
    """Actualiza nombre, valores de columna o posición de un sub-item."""
    subitem = _buscar_o_404(db, ProjectSubItem, subitem_id, "Sub-item no encontrado")
    if data.name is not None:
        subitem.name = data.name
    if data.column_values is not None:
        _merge_column_values(subitem, data.column_values)
    if data.position is not None:
        subitem.position = data.position
    db.commit()
    return {"ok": True}


@router.delete("/subitems/{subitem_id}")
def eliminar_subitem(subitem_id: int, db: Session = Depends(get_db)):
    """Elimina un sub-item."""
    subitem = _buscar_o_404(db, ProjectSubItem, subitem_id, "Sub-item no encontrado")
    db.delete(subitem)
    db.commit()
    return {"ok": True}
