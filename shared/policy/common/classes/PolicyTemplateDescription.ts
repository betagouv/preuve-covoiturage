export class PolicyTemplateDescriptions {
  static readonly template_one_description_html = `<div>
  <div>
    <div>Trajets éligibles:</div>
    <ul>
      <li> Trajets avec origine OU destination sur le territoire</li>
      <li> Trajets de plus de 2 km </li>
      <li>La simulation prend en compte les volumes de trajets de l'ensemble des opérateurs sur votre territoire. 
      Pour affiner la simulation sur un ou plusieurs opérateurs spécifiques, 
      contactez territoire@covoiturage.beta.gouv.fr</li>
      <li> Classe de preuve B ou C</li>
    </ul>
  </div>
  <div>
    <div>Incitation:</div>
    <ul>
      <li> Versée au conducteur </li>
      <li> De 2 à 20 km : 2 euros par trajet </li>
      <li> À partir de 20 km : 0.1 euro par trajet par km </li>
    </ul>
  </div>
</div>`;

  static readonly template_two_description_html = `    
<div>
  <div>
    <div>Trajets éligibles:</div>
    <ul>
      <li> Trajets avec Origine ET Destination sur le territoire</li>
      <li> Trajets de plus de 2 km</li>
      <li>La simulation prend en compte les volumes de trajets de l'ensemble des opérateurs sur votre territoire. 
      Pour affiner la simulation sur un ou plusieurs opérateurs spécifiques, 
      contactez territoire@covoiturage.beta.gouv.fr</li>
      <li> Class de preuve B et C</li>
    </ul>
  </div>
  <div>
    <div>Incitation:</div>
    <ul>
      <li> Versée au conducteur </li>
      <li> De 2 à 15 km : 1,5 euros par trajet par passager</li>
      <li> De 15 à 30 km : 0,1 euro par trajet par km par passager</li>
    </ul>
  </div>
</div>`;

  static readonly template_three_description_html = `
<div>
  <div>
    <div>Trajets éligibles:</div>
    <ul>
      <li> Trajets avec Origine ET Destination sur le territoire</li>
      <li> Trajets de plus de 2 km</li>
      <li>La simulation prend en compte les volumes de trajets de l'ensemble des opérateurs sur votre territoire. 
      Pour affiner la simulation sur un ou plusieurs opérateurs spécifiques, 
      contactez territoire@covoiturage.beta.gouv.fr</li>
      <li> Class de preuve B et C</li>
    </ul>
  </div>
  <div>
    <div>Incitation:</div>
    <ul>
      <li> Versée au conducteur </li>
      <li> A partir de 2 km : 0,5 euros par trajet par passager</li>
    </ul>
  </div>
</div>`;

  static readonly get = {
    '1': this.template_one_description_html,
    '2': this.template_two_description_html,
    '3': this.template_three_description_html,
  };
}
