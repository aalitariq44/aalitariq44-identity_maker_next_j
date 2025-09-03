export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface BaseShape {
  id: string
  type: 'rect' | 'circle' | 'text' | 'triangle' | 'image' | 'person' | 'qr' | 'barcode'
  position: Position
  size: Size
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  zIndex: number
}

export interface RectShape extends BaseShape {
  type: 'rect'
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
}

export interface CircleShape extends BaseShape {
  type: 'circle'
  fill: string
  stroke: string
  strokeWidth: number
  radius: number
}

export interface TextShape extends BaseShape {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold' | 'lighter'
  fontStyle: 'normal' | 'italic'
  fill: string
  stroke: string
  strokeWidth: number
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  lineHeight: number
  letterSpacing: number
}

export interface TriangleShape extends BaseShape {
  type: 'triangle'
  fill: string
  stroke: string
  strokeWidth: number
  points: number[]
}

export interface ImageShape extends BaseShape {
  type: 'image'
  src: string
  cropX: number
  cropY: number
  cropWidth: number
  cropHeight: number
}

export interface PersonShape extends BaseShape {
  type: 'person'
  src?: string
  placeholder: boolean
  borderRadius: number
  borderWidth: number
  borderColor: string
}

export interface QRShape extends BaseShape {
  type: 'qr'
  data: string
  size: Size
  backgroundColor: string
  foregroundColor: string
}

export interface BarcodeShape extends BaseShape {
  type: 'barcode'
  data: string
  format: '128' | 'CODE39' | 'EAN13' | 'UPC'
  backgroundColor: string
  lineColor: string
}

export type Shape = RectShape | CircleShape | TextShape | TriangleShape | ImageShape | PersonShape | QRShape | BarcodeShape

export interface CanvasSettings {
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  backgroundColor: string
  backgroundImage?: string
  backgroundSize: 'cover' | 'contain' | 'stretch' | 'tile'
  backgroundPattern?: string
  backgroundOpacity: number
  gridSize: number
  showGrid: boolean
  snapToGrid: boolean
  zoom: number
  gridColor: string
  gridType: 'lines' | 'dots' | 'crosses' | 'diagonal'
}

export interface EditorState {
  shapes: Shape[]
  selectedShapeId: string | null
  canvasSettings: CanvasSettings
  history: {
    past: Shape[][]
    present: Shape[]
    future: Shape[][]
  }
  clipboard: Shape[]
}

export interface CardSize {
  name: string
  width: number
  height: number
  description: string
}

export const CARD_SIZES: CardSize[] = [
  {
    name: 'بطاقة ماستركارد',
    width: 856,
    height: 540,
    description: '85.60 × 53.98 ملم',
  },
  {
    name: 'بطاقة هوية مدرسية',
    width: 900,
    height: 560,
    description: '90 × 56 ملم',
  },
  {
    name: 'بطاقة أعمال',
    width: 890,
    height: 510,
    description: '89 × 51 ملم',
  },
  {
    name: 'بطاقة مخصصة',
    width: 800,
    height: 500,
    description: 'حجم مخصص',
  },
]
