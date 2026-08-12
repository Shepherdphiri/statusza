export interface RefugeeParticulars {
  nameAndSurname: string;
  gender: string;
  dateOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  maritalStatus: string;
  validFrom: string;
  validTo: string;
  refugeesActSection: string;
}

export interface ReceptionOfficialData {
  sectionHeader?: string; // "REFUGEE RECEPTION OFFICIAL"
  capturedByTitle?: string; // "CAPTURED BY"
  printedByTitle?: string; // "PRINTED BY"
  capturedByName: string;
  capturedByAppointmentNo: string;
  capturedByDate: string;
  capturedByPlace: string;
  originallyIssuedIn: string;
  
  printedByName: string;
  printedByAppointmentNo: string;
  printedByDate: string;
  printedByPlace: string;
  numberOfExtensions: string;
}

export interface StampData {
  officeName: string;
  receptionOfficeText: string;
  issuingOfficeText: string;
  dateText: string;
  locationCodeText: string;
  stampColor: string; // e.g. '#6b21a8' or '#831843'
  rotation: number; // e.g. -2 degrees
  opacity: number;
  hasSlashMark: boolean;
  hasFingerprint: boolean;
}

export interface DocumentMetadata {
  formNumber: string; // "BI-1693"
  topBarcodeValue: string; // "CTRMW000660412"
  bottomBarcodeValue: string; // "200141870"
  issuingPlace: string; // "Cape Town"
  issuingDate: string; // "12/03/2015"
  templateCode: string; // "83/DHA-1707B"
  watermarkText: string; // "CAPE TOWN"
  directorGeneralTitle?: string; // "p.p. DIRECTOR-GENERAL"
  directorGeneralDepartment?: string; // "DEPARTMENT OF HOME AFFAIRS"
}

export interface BackgroundSettings {
  borderColor: string; // "#d82362" (authentic pink frame)
  borderWidth: number; // e.g., 6px
  showBorderFrame?: boolean; // Toggle to enable/disable or completely remove outer frame
  showSecurityPattern?: boolean; // Security Guilloche wave pattern overlay
  paperStyle: 'authentic' | 'clean-white' | 'aged-vintage' | 'creme-pattern' | 'custom-image';
  paperTextureOpacity: number;
  customBgImageUrl?: string;
  watermarkOpacity: number;
  watermarkText: string;
  showCornerDots: boolean;
  showScanNoise: boolean;
}

export interface TextFormatSettings {
  fontSize?: number; // e.g., 13
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  fontFamily?: 'arial' | 'helvetica' | 'times' | 'georgia' | 'trebuchet' | 'verdana' | 'impact' | 'sans' | 'serif' | 'courier' | 'mono';
  color?: string; // hex color e.g., '#000000'
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number; // e.g. 1.25
  letterSpacing?: string; // e.g. '0.05em'
}

export interface CustomTextBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  scale?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  fontFamily?: 'arial' | 'helvetica' | 'times' | 'georgia' | 'trebuchet' | 'verdana' | 'impact' | 'sans' | 'serif' | 'courier' | 'mono' | string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  visible?: boolean;
}

export interface ElementPosition {
  x: number; // delta X in px
  y: number; // delta Y in px
  scale?: number; // element scale factor, default 1.0
  width?: number; // optional custom width in px
  height?: number; // optional custom height in px
  visible?: boolean;
}

export type ElementKey =
  | 'header'
  | 'coatOfArms'
  | 'coatOfArmsText'
  | 'topBarcode'
  | 'photo'
  | 'biBox'
  | 'title'
  | 'particulars'
  | 'certification'
  | 'directorGeneral'
  | 'stampBlock'
  | 'officialsTable'
  | 'bottomBarcode'
  | 'formCode'
  | 'watermark';

export type LayoutPositions = Record<ElementKey, ElementPosition>;

export interface DocumentState {
  metadata: DocumentMetadata;
  particulars: RefugeeParticulars;
  officials: ReceptionOfficialData;
  stamp: StampData;
  background: BackgroundSettings;
  photoUrl: string;
  customCoatOfArmsUrl?: string;
  customTopBarcodeUrl?: string;
  customBottomBarcodeUrl?: string;
  directorGeneralSignatureUrl: string;
  rsdoSignatureUrl: string;
  permitHolderSignatureUrl: string;
  fingerprintUrl: string;
  layout: LayoutPositions;
  textFormats?: Partial<Record<ElementKey, TextFormatSettings>>;
  customTexts?: CustomTextBlock[];
}
