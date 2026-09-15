"""
Servicio desacoplado para la construcción de reportes en hojas de cálculo Excel (.xlsx).
Encapsula toda la lógica de presentación visual, paletas de colores corporativas,
bordes, alineación y anchos de columna con openpyxl, sin dependencias directas
de SQLAlchemy ni FastAPI.
"""
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
import io

# ── Estilos corporativos para reportes Excel ─────────────────
HEADER_FONT = Font(name="Calibri", bold=True, size=11, color="FFFFFF")
HEADER_FILL = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
HEADER_ALIGN = Alignment(horizontal="center", vertical="center", wrap_text=True)
THIN_BORDER = Border(
    left=Side(style="thin"),
    right=Side(style="thin"),
    top=Side(style="thin"),
    bottom=Side(style="thin"),
)


class ExcelReportBuilder:
    """Constructor especializado en la maquetación y generación de reportes Excel."""

    @staticmethod
    def _aplicar_estilo_encabezado(worksheet, fila: int, total_columnas: int):
        """Aplica tipografía, fondo corporativo y bordes a la fila de encabezados."""
        for columna in range(1, total_columnas + 1):
            celda = worksheet.cell(row=fila, column=columna)
            celda.font = HEADER_FONT
            celda.fill = HEADER_FILL
            celda.alignment = HEADER_ALIGN
            celda.border = THIN_BORDER

    @staticmethod
    def _escribir_filas(worksheet, fila_inicio: int, filas_datos: list) -> int:
        """Escribe una matriz de datos en las celdas aplicando borde continuo a cada una."""
        fila_actual = fila_inicio
        for datos_fila in filas_datos:
            for columna, valor in enumerate(datos_fila, 1):
                celda = worksheet.cell(row=fila_actual, column=columna, value=valor)
                celda.border = THIN_BORDER
            fila_actual += 1
        return fila_actual

    @classmethod
    def build_icsoe(cls, filas_empleados: list) -> Workbook:
        """
        Genera el libro Excel para el reporte ICSOE (formato de captura IMSS).
        Columnas esperadas: [nss, curp, salario_base_cotizacion]
        """
        wb = Workbook()
        hoja = wb.active
        hoja.title = "captura"

        encabezados = [
            "NSS(11 dígitos)",
            " CURP(18 caracteres)",
            " Salario base de cotización(numérico con 2 decimales)",
        ]
        for columna, encabezado in enumerate(encabezados, 1):
            hoja.cell(row=1, column=columna, value=encabezado)
        cls._aplicar_estilo_encabezado(hoja, 1, len(encabezados))

        cls._escribir_filas(hoja, 2, filas_empleados)

        for columna in range(1, len(encabezados) + 1):
            hoja.column_dimensions[chr(64 + columna) if columna <= 26 else "A"].width = 18

        return wb

    @classmethod
    def build_sisub_contratos(cls, filas_contratos: list) -> Workbook:
        """
        Genera el libro Excel para el reporte SISUB de Contratos (INFONAVIT).
        """
        wb = Workbook()
        hoja = wb.active
        hoja.title = "SISUB Contratos"

        encabezados = [
            "No. Contrato",
            "Objeto del Contrato",
            "Monto",
            "Trabajadores Estimados",
            "Vigencia",
            "Fecha Inicio",
            "Fecha Fin",
            "RFC Beneficiario",
            "Razón Social Beneficiario",
            "Registro Patronal",
        ]
        for columna, encabezado in enumerate(encabezados, 1):
            hoja.cell(row=1, column=columna, value=encabezado)
        cls._aplicar_estilo_encabezado(hoja, 1, len(encabezados))

        cls._escribir_filas(hoja, 2, filas_contratos)

        # Ajuste automático de ancho de columnas básico
        for col_idx in range(1, len(encabezados) + 1):
            letra = chr(64 + col_idx) if col_idx <= 26 else "A"
            hoja.column_dimensions[letra].width = 20

        return wb

    @classmethod
    def build_sisub_trabajadores(cls, filas_trabajadores: list) -> Workbook:
        """
        Genera el libro Excel para el reporte SISUB de Trabajadores (INFONAVIT).
        """
        wb = Workbook()
        hoja = wb.active
        hoja.title = "SISUB Trabajadores"

        encabezados = [
            "No. Contrato",
            "RFC Trabajador",
            "CURP Trabajador",
            "Nombre Trabajador",
            "NSS",
        ]
        for columna, encabezado in enumerate(encabezados, 1):
            hoja.cell(row=1, column=columna, value=encabezado)
        cls._aplicar_estilo_encabezado(hoja, 1, len(encabezados))

        cls._escribir_filas(hoja, 2, filas_trabajadores)

        for col_idx in range(1, len(encabezados) + 1):
            letra = chr(64 + col_idx) if col_idx <= 26 else "A"
            hoja.column_dimensions[letra].width = 22

        return wb

    @staticmethod
    def workbook_to_bytes(workbook: Workbook) -> io.BytesIO:
        """Serializa un objeto Workbook a un buffer de bytes en memoria."""
        buffer = io.BytesIO()
        workbook.save(buffer)
        buffer.seek(0)
        return buffer
