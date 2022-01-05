## Prérequis

- [Générer un token applicatif](/operateurs/preuves/acces.html)
- Avoir des trajets de plus de 5 jours sur l'environnement de test pour une identité (`phone: +33611223344`) ([voir comment envoyer des preuves](/operateurs/preuves/schema.html))

## PHP

### Création de l'attestation

#### Requête

```PHP
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.demo.covoiturage.beta.gouv.fr/v2/certificates",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>'{"tz":"Europe/Paris","identity":{"phone":"+33611223344"}}',
  CURLOPT_HTTPHEADER => array(
    "Content-Type: application/json",
    "Authorization: Bearer ey..."
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
```

#### Réponse

> Les données calculées sont données à titre d'exemple

```json
{
  "uuid": "1b37ff76-dac6-44b0-ba78-9015a8a198fc",
  "created_at": "2021-03-14T10:12:02.119Z",
  "meta": {
    "tz": "Europe/Paris",
    ...
  }
}
```

### Téléchargement du PDF sans meta-données

#### Requête

> Utiliser le UUID retourné par la création d'attestation pour récupérer le PDF

```php
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.demo.covoiturage.beta.gouv.fr/v2/certificates/pdf",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>'{"uuid":"1b37ff76-dac6-44b0-ba78-9015a8a198fc"}',
  CURLOPT_HTTPHEADER => array(
    "Content-Type: application/json",
    "Authorization: Bearer ey..."
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
```

#### Réponse

> Réponse binaire de type application/pdf

### Téléchargement du PDF avec meta-données

#### Requête

> Utiliser le UUID retourné par la création d'attestation pour récupérer le PDF

```php
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.demo.covoiturage.beta.gouv.fr/v2/certificates/pdf",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS =>'{
    "uuid": "1b37ff76-dac6-44b0-ba78-9015a8a198fc",
    "meta": {
        "operator": {
            "content": "Informations\nsur l\'opérateur"
        },
        "identity": {
            "name": "Jean-Michel Toutenauto",
            "content": "1 rue du Paradis\n75010\nParis"
        },
        "notes": "Vestibulum ac urna eleifend, sodales metus sit amet, pretium lectus. Curabitur ut congue dolor, viverra finibus felis. Donec sodales, nisi id finibus auctor, quam tellus eleifend leo, sed tempus quam augue ac lacus. Nulla lorem augue, placerat ut tristique sed, suscipit eu purus."
    }
}',
  CURLOPT_HTTPHEADER => array(
    "Content-Type: application/json",
    "Authorization: Bearer ey..."
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
```

#### Réponse

> Réponse binaire de type application/pdf
