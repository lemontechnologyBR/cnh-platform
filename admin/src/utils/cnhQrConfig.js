/** QR estilo CNH oficial — grade densa 57×57+ módulos (versão 15, ECC H) */
export const CNH_QR_MIN_VERSION = 15

export const CNH_QR_SVG_PROPS = {
  level: 'H',
  minVersion: CNH_QR_MIN_VERSION,
  marginSize: 1,
  includeMargin: true,
  boostLevel: false,
}

export const CNH_QR_PDF_OPTIONS = {
  errorCorrectionLevel: 'H',
  version: CNH_QR_MIN_VERSION,
  margin: 1,
  width: 1536,
}
