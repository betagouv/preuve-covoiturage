backend:
	@docker-compose down
	@docker-compose up api

aom:
	@echo "Type the following command when the container has started"
	@echo "> ng serve --host 0.0.0.0"
	@docker-compose run -p 4200:4200 aom bash

operator:
	@echo "Type the following command when the container has started"
	@echo "> ng serve --host 0.0.0.0 --port 4400"
	@docker-compose run -p 4400:4400 operator bash

registry:
	@echo "Type the following command when the container has started"
	@echo "> ng serve --host 0.0.0.0 --port 4600"
	@docker-compose run -p 4600:4600 registry bash


edit:
	@docker-compose up editor

install: wipe fix
	@docker-compose down
	@docker-compose build --force-rm
	@docker-compose run api yarn
	@docker-compose run aom yarn
	@docker-compose run operator yarn
	@docker-compose run registry yarn
	@echo "Installation completed"

wipe: fix
	@rm -rf api/node_modules
	@rm -rf aom/node_modules
	@rm -rf ope/node_modules
	@rm -rf reg/node_modules

fix:
	@sudo chown -R $(shell whoami): api
	@sudo chown -R $(shell whoami): aom
	@sudo chown -R $(shell whoami): ope
	@sudo chown -R $(shell whoami): reg

