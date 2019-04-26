import { IncentiveInseeFilterComponent } from '../components/filters/insee/component';

export class InseeFilter {
  public static title = 'INSEE';
  public static description = 'Filtre en fonction de l`insee de départ et d\'arrivée;';
  public static key = 'insee';

  public static import(data) {
    if (data) {
      return data;
    }
    return {
      whiteList: {
        start: [],
        end: [],
      },
      blackList: {
        start: [],
        end: [],
      },

    };
  }

  public static getFormComponent() {
    return IncentiveInseeFilterComponent;
  }

  public static export(data) {
    if (
      data.whiteList.start.length === 0 &&
      data.whiteList.end.length === 0 &&
      data.blackList.start.length === 0 &&
      data.blackList.end.length === 0
    ) {
      return null;
    }
    return data;
  }

  public static toString(data):string {
    let text = `Les trajets dont : <br>`;
    if (data.whiteList.start.length > 0) {
      text += `&nbsp; - les codes INSEEs de départ sont : ${data.whiteList.start.sort().join(', ')} <br>`;
    }
    if (data.whiteList.end.length > 0) {
      text += `&nbsp; - les codes INSEEs d'arrivée sont : ${data.whiteList.end.sort().join(', ')} <br>`;
    }
    if (data.blackList.start.length > 0) {
      text += `&nbsp; - les codes INSEEs de départ ne sont pas : ${data.blackList.start.sort().join(', ')} <br>`;
    }
    if (data.blackList.end.length > 0) {
      text += `&nbsp; - les codes INSEEs d'arrivée ne sont pas : ${data.blackList.end.sort().join(', ')}`;
    }
    return text;
  }
}
