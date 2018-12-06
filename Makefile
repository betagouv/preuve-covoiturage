install:
	@docker-compose down
	@docker-compose build --force-rm
	@git clone git@github.com:betagouv/preuve-covoiturage-api.git back-api
	@git clone git@github.com:betagouv/preuve-covoiturage-dashboard.git dashboard
	@docker-compose run dashboard yarn
	@echo "Installation completed"

backend:
	@docker-compose up api

dash:
	@docker-compose run -p 4200:4200 dashboard bash -c "ng serve --host 0.0.0.0"

wipe: fix
	@rm -rf back-api/node_modules
	@rm -rf front-dashboard/node_modules

fix:
	mkdir -p back-api
	mkdir -p dashboard
	sudo chown -R $(shell whoami): back-api
	sudo chown -R $(shell whoami): dashboard

