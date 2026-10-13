export interface AnalyseInterface {
  val: number;
  // borne haute réelle de la classe (jenks) ; absente pour des seuils fixes
  max?: number;
  color: [number, number, number];
  width: number;
}

export interface SwitchFilterInterface {
  name: string;
  active: boolean;
}
