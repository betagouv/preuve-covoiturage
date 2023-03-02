server {
    listen      80;
    listen      [::]:80;
    server_name $$SITE_DOMAIN;

    # security
    include     shared/security.conf;

    # reverse proxy
    location / {
        proxy_pass            https://$$SITE_DOMAIN.$$S3_DOMAIN;
        proxy_set_header Host $host;
        include               shared/proxy.conf;
    }

    # additional config
    include shared/general.conf;
}
