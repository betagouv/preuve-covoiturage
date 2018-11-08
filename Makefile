start:
	@docker-compose down
	@docker-compose up api

aom:
	@echo "Type the following command when the container has started"
	@echo "> ng serve --host 0.0.0.0"
	@docker-compose run -p 4200:4200 aom bash

install: wipe fix
	@docker-compose down
	@docker-compose build --force-rm
	@docker-compose run api yarn
	@docker-compose run aom yarn
	@echo "Installation completed"

wipe: fix
	@rm -rf api/node_modules
	@rm -rf dashboard-aom/node_modules
	@rm -rf dashboard-registry/node_modules

fix:
	@sudo chown -R $(shell whoami): api
	@sudo chown -R $(shell whoami): dashboard-aom
	@sudo chown -R $(shell whoami): dashboard-registry

