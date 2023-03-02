#!/usr/bin/env bash
S3_DOMAIN=s3.fr-par.scw.cloud
for SITE_DOMAIN in $(cat /tmp/scripts/domain.env)
do
  sed -e "s/\$\$SITE_DOMAIN/$SITE_DOMAIN/g" -e "s/\$\$S3_DOMAIN/$S3_DOMAIN/g" /tmp/scripts/site.conf.tpl > /etc/nginx/sites-enabled/$SITE_DOMAIN.conf
done