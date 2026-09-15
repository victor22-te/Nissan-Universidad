/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cuatrimestresAPI, reportesAPI } from './api';

describe('API Services (Comportamiento Actual)', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Función base request() a través de cuatrimestresAPI.listar', () => {
    it('debería retornar datos parseados como JSON en una respuesta 200 OK (Caso normal)', async () => {
      const mockData = [{ id: 1, nombre: 'Enero - Abril 2026' }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' })
      });

      const result = await cuatrimestresAPI.listar();
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/cuatrimestres/', expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('debería lanzar error con el mensaje de "detail" si la respuesta no es ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Cuatrimestre no encontrado' })
      });

      await expect(cuatrimestresAPI.listar()).rejects.toThrow('Cuatrimestre no encontrado');
    });

    it('debería lanzar "Error de servidor" si la respuesta no es ok y no se puede parsear a JSON (Caso límite)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new SyntaxError('Invalid JSON'); }
      });

      // TODO: este comportamiento puede ser bug, verificar si queremos enmascarar errores de parseo con "Error de servidor"
      await expect(cuatrimestresAPI.listar()).rejects.toThrow('Error de servidor');
    });

    it('debería lanzar "Error desconocido" si la respuesta de error JSON no contiene la propiedad "detail" (Comportamiento actual incorrecto)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Bad request', error: 'Algo salió mal' }) // No tiene .detail
      });

      // TODO: este comportamiento puede ser bug, verificar, ya que perdemos el mensaje real del servidor si no viene en 'detail'
      await expect(cuatrimestresAPI.listar()).rejects.toThrow('Error desconocido');
    });
  });

  describe('Descarga de reportes: reportesAPI.descargarICSOE', () => {
    beforeEach(() => {
      // Mockear la API del DOM para crear URLs y elementos
      global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-uuid');
      global.URL.revokeObjectURL = vi.fn();

      const mockAnchor = {
        click: vi.fn(),
        href: '',
        download: '',
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    });

    it('debería descargar el reporte si el content-type incluye "spreadsheet" (Caso normal)', async () => {
      const mockBlob = new Blob(['dummy content']);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        blob: async () => mockBlob
      });

      await reportesAPI.descargarICSOE(1);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/reportes/icsoe/1', expect.any(Object));
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith('a');

      const anchor = document.createElement.mock.results[0].value;
      expect(anchor.download).toBe('ICSOE_Reporte.xlsx');
      expect(anchor.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
    });

    it('intentará parsear como JSON y fallará si la descarga es exitosa pero el content-type NO incluye "spreadsheet" (Comportamiento actual incorrecto)', async () => {
      // El backend envía el excel pero olvida/omite el header 'content-type' o envía 'application/octet-stream'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/octet-stream' }), // No incluye "spreadsheet"
        json: async () => { throw new SyntaxError('Unexpected token P in JSON at position 0'); },
        blob: async () => new Blob(['dummy content'])
      });

      // TODO: este comportamiento puede ser bug, verificar. La función request asume que si no dice spreadsheet, es JSON y revienta al parsear.
      await expect(reportesAPI.descargarICSOE(1)).rejects.toThrow('Unexpected token P in JSON at position 0');
    });
  });
});
