FROM nginx:1.23
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx ./conf.d /etc/nginx/conf.d
COPY --chown=nginx:nginx shared /etc/nginx/shared 
COPY --chown=nginx:nginx ./sites-enabled /etc/nginx/sites-enabled
COPY --chown=nginx:nginx ./scripts /tmp/scripts
RUN /tmp/scripts/buildconf.sh
RUN rm -rf /tmp/scripts