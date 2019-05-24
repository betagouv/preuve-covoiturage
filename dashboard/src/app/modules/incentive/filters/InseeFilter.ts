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
        or: {
          start: [],
          end: [],
        },
        and: {
          start: [],
          end: [],
        },
      },
      blackList: {
        or: {
          start: [],
          end: [],
        },
        and: {
          start: [],
          end: [],
        },
      },

    };
  }

  public static getFormComponent() {
    return IncentiveInseeFilterComponent;
  }

  public static export(data) {
    if (
      data.whiteList.or.start.length === 0 &&
      data.whiteList.or.end.length === 0 &&
      data.blackList.or.start.length === 0 &&
      data.blackList.or.end.length === 0 &&
      data.whiteList.and.start.length === 0 &&
      data.whiteList.and.end.length === 0 &&
      data.blackList.and.start.length === 0 &&
      data.blackList.and.end.length === 0

  ) {
      return null;
    }
    return data;
  }

  public static toString(data):string {
    let text = `Les trajets dont : <br>`;
    if (data.whiteList.or.start.length > 0) {
      text += `&nbsp; - les codes INSEEs de départ sont parmi : ${data.whiteList.or.start.sort().join(', ')} <br>`;
    }
    if (data.whiteList.or.end.length > 0) {
      if (data.whiteList.or.start.length > 0) {
        text += `&nbsp; &nbsp; OU`;
      } else {
        text += `&nbsp; -`;
      }
      text += ` les codes INSEEs d'arrivée sont parmi : ${data.whiteList.or.end.sort().join(', ')} <br>`;
    }
    if (data.blackList.or.start.length > 0) {
      text += `&nbsp; - les codes INSEEs de départ ne sont pas parmi : ${data.blackList.or.start.sort().join(', ')} <br>`;
    }
    if (data.blackList.or.end.length > 0) {
      if (data.blackList.or.start.length > 0) {
        text += `&nbsp; &nbsp; OU`;
      } else {
        text += `&nbsp; -`;
      }
      text += ` les codes INSEEs d'arrivée ne sont pas parmi : ${data.blackList.or.end.sort().join(', ')} <br>`;
    }
    if (data.whiteList.and.start.length > 0 && data.whiteList.and.end.length > 0) {
      text += `&nbsp; - les codes INSEEs de départ sont parmi : ${data.whiteList.and.start.sort().join(', ')} <br>`;
      text += `&nbsp; &nbsp; ET les codes INSEEs d'arrivée sont parmi : ${data.whiteList.and.end.sort().join(', ')} <br>`;
    }
    if (data.blackList.and.start.length > 0 && (data.blackList.and.end.length > 0)) {
      text += `&nbsp; - les codes INSEEs de départ ne sont pas parmi : ${data.blackList.and.start.sort().join(', ')} <br>`;
      text += `&nbsp; &nbsp; ET les codes INSEEs d'arrivée ne sont pas parmi : ${data.blackList.and.end.sort().join(', ')}`;
    }
    return text;
  }
}
