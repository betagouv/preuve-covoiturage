export class PolicyTemplateDescriptions {
  static readonly template_one_description_html = `<div>
  <div>
    <div>Trajets éligibles:</div>
    <ul>
      <li> trajet avec origine OU destination sur le territoire</li>
      <li> De 2 à 15km: 2 euros par trajet par passager </li>
      <li> De 15 à 30 km: 0,1 euro par trajet par km par passager </li>
    </ul>
  </div>
  <div>
    <div>Restrictions:</div>
    <ul>
      <li>6 trajets maximum pour le conducteur par jour</li>
      <li>150 euros maximum pour le conducteur par mois</li>
      <li>Class de preuve B ou C</li>
    </ul>
  </div>
</div>`;

  static readonly template_two_description_html = `    
<div>
  <div>
    <div>Trajets éligibles:</div>
    <ul>
      <li> Trajets avec Origine ET Destination sur le territoire</li>
      <li> Trajets de plus de 2km</li>
      <li> Multiopérateur</li>
      <li> Class de preuve B et C</li>
    </ul>
  </div>
  <div>
    <div>Incitation:</div>
    <ul>
      <li> De 2 à 15km: 1,5 euros par trajet par passager</li>
      <li> De 15 à 30km: 0,1 euro par trajet par km par passager</li>
    </ul>
  </div>
</div>`;

  static readonly template_three_description_html = `
<div>
  <div>
    <div>Trajets éligibles:</div>
    <ul>
      <li> Trajets avec Origine ET Destination sur le territoire</li>
      <li> Trajets de plus de 2km</li>
      <li> Multiopérateur</li>
      <li> Class de preuve B et C</li>
    </ul>
  </div>
  <div>
    <div>Incitation:</div>
    <ul>
      <li> A partir de 2km: 0,5 euros par trajet par passager</li>
    </ul>
  </div>
</div>`;

  static readonly get = {
    '1': this.template_one_description_html,
    '2': this.template_two_description_html,
    '3': this.template_three_description_html,
  };
}
