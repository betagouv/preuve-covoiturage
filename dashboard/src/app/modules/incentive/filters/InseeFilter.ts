import { IncentiveInseeFilterComponent } from '../components/filters/insee/component';

export class InseeFilter {
  public static title = 'INSEE';
  public static description = 'Filtre en fonction de l`insee de départ et d\'arrivée;';
  public static key = 'insee';

  public static import(data) {
    if (data) {
      return data;
    }
    return [];
  }

  public static getFormComponent() {
    return IncentiveInseeFilterComponent;
  }

  public static export(data) {
    return data;
  }

  public static toString(data):string {
    let text = `Les trajets dont : \n`;
    if (data.whitelist && data.whitelist.start) {
      text += `les codes INSEEs de départs sont : ${data.whitelist.start.sort().join(', ')} \n`;
    }
    if (data.whitelist && data.whitelist.end) {
      text += `les codes INSEEs d'arrivées sont : ${data.whitelist.end.sort().join(', ')} \n`;
    }
    if (data.blackList && data.blackList.start) {
      text += `les codes INSEEs de départs ne sont pas : ${data.blackList.start.sort().join(', ')} \n`;
    }
    if (data.blackList && data.blackList.end) {
      text += `les codes INSEEs d'arrivées sont : ${data.blackList.end.sort().join(', ')}`;
    }
    return text;
  }
}
