// Base: cnh_luis.pdf (CNH_LUIS_ANTONIO_ARRIEL_CAPELETO.pdf) — texto nativo na camada PDF
export const LUIS_PDF_URL = '/cnh_luis.pdf'
export const RENDER_SCALE = 3

export const CARD_REGIONS = {
  frente: { left: 75, top: 118, width: 745, height: 580 },
  verso:  { left: 75, top: 738, width: 745, height: 580 },
}

/** @type {import('../utils/cnhCanvas.js').FieldBox[]} */
// dataTop/dataBottom corrigidos via OCR (cnh_template_ocr.json) — posição real do valor, não do rótulo
export const FRENTE_FIELDS = [
  { key: 'nome',          left: 144, right: 598, dataTop: 214, dataBottom: 230, size: 15, bold: true, color: '#363636' },
  { key: 'primeiraHab',   left: 610, right: 728, dataTop: 214, dataBottom: 231, size: 15, bold: true, color: '#363636' },
  { key: 'nascimento',    left: 348, right: 738, dataTop: 257, dataBottom: 275, size: 15, bold: true, color: '#363636' },
  { key: 'emissao',       left: 348, right: 453, dataTop: 292, dataBottom: 310, size: 15, bold: true, color: '#363636' },
  { key: 'validade',      left: 473, right: 578, dataTop: 292, dataBottom: 310, size: 15, bold: true, center: true, pad: 6, color: '#D50000' },
  { key: 'docIdentidade', left: 348, right: 738, dataTop: 345, dataBottom: 360, size: 15, bold: true, color: '#363636' },
  { key: 'cpf',           left: 348, right: 453, dataTop: 389, dataBottom: 404, size: 15, bold: true, color: '#363636' },
  { key: 'registro',      left: 495, right: 603, dataTop: 388, dataBottom: 404, size: 15, bold: true, center: true, pad: 6, color: '#D50000' },
  { key: 'catHab',        left: 626, right: 733, dataTop: 389, dataBottom: 404, size: 15, bold: true, center: true, pad: 6, color: '#D50000' },
  { key: 'nacionalidade', left: 348, right: 738, dataTop: 434, dataBottom: 457, size: 15, bold: true, color: '#363636' },
  { key: 'filiacao1',     left: 348, right: 738, dataTop: 475, dataBottom: 491, size: 15, bold: true, color: '#363636' },
  { key: 'filiacao2',     left: 348, right: 738, dataTop: 522, dataBottom: 538, size: 15, bold: true, color: '#363636' },
]

export const VERSO_CAT_ROWS = {
  ACC: 65, A: 91, A1: 117, B: 143, B1: 169, C: 195, C1: 221,
}

/** @type {import('../utils/cnhCanvas.js').FieldBox[]} */
export const VERSO_FIELDS = [
  { key: 'validadeB', left: 348, right: 408, dataTop: 131, dataBottom: 152, size: 12, bold: true, center: true, color: '#D50000' },
  { key: 'local',     left: 112, right: 400, dataTop: 336, dataBottom: 356, size: 13, bold: true, color: '#363636' },
]

/** MRZ — coordenadas no card verso */
export const VERSO_MRZ_FIELDS = [
  { key: 'mrz3', left: 135, right: 520, dataTop: 88,  dataBottom: 108, size: 14, color: '#363636' },
  { key: 'mrz2', left: 135, right: 520, dataTop: 124, dataBottom: 144, size: 14, color: '#363636' },
  { key: 'mrz1', left: 135, right: 520, dataTop: 160, dataBottom: 180, size: 14, color: '#363636' },
]

/** Textos nativos PDF do verso (cnh.pdf) — substituídos via pdf-lib */
export const VERSO_PDF_TEXT = []
