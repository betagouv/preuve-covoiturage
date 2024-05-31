# Utilisation en ligne de commande
L'utilisation du programme en ligne de commande peut se faire de deux façons :
- Si vous avez cloner le projet, il suffit d'utiliser la ligne de commande 
```shell
  yarn start [options] [commande]
```

Si vous utilisez le paquet comme dépendance de votre projet, il suffit d'ajouter un script npm dans votre fichier package.json de la façon suivante  :
```json
{
  "scripts": {
    "evolution-geo": "evolution-geo"
  }
}
```

Maintenant, vous pouvez utiliser le programme avec la ligne de commande :
```shell
  yarn evolution-geo [options] [commande]
```

## Options communes
- `-v, --verbose <level>`: Mode verbeux, prend pour valeur la variable d'environnement LOG_LEVEL ou la valeur par défaut: "error"
- `-h, --help` : Affiche l'aide des commandes

### Connection à la base de données
- `--url <url>` : Postgresql url, prend pour valeur la variable d'environnement POSTGRES_URL ou la valeur par défaut: "postgres://postgres:@127.0.0.1:5432/local".
- `-u, --user <user>` : Postgresql user, prend pour valeur la variable d'environnement POSTGRES_USER ou la valeur par défaut: "postgres".
- `-W, --password <password>` : Postgresql password, prend pour valeur la variable d'environnement POSTGRES_PASSWORD.
- `-H, --host <host>` : Postgresql host, prend pour valeur la variable d'environnement POSTGRES_HOST ou la valeur par défaut: "127.0.0.1".
- `-p, --port <port>` : Postgresql port, prend pour valeur la variable d'environnement POSTGRES_PORT ou la valeur par défaut: 5432.
- `-d, --database <database>` : Postgresql database, prend pour valeur la variable d'environnement POSTGRES_DB ou la valeur par défaut: "local".
- `-S, --schema <schema>` : Postgresql schema, prend pour valeur la variable d'environnement POSTGRES_SCHEMA ou la valeur par défaut: "public".

### Dossier de téléchargement
- `-d, --directory <directory>` : Chemin vers le répertoire de téléchargment, prend pour valeur la variable d'environnement CACHE_DIRECTORY ou le répertoire temporaire de l'os par défaut si la variable d'environnement est manquante.


## Commande `import`
La commande `import` permet de jouer les datasets qui n'ont pas encore été importé.
- `--no-cleanup` : permet de désactiver la suppression des tables intermédiaires

## Commande `status`
La commande `status` permet de connaitre l'état des datasets dans la base de données cible.
