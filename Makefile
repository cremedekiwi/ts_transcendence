all: dev

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

dev:
	docker-compose up --build

copy-translation:
	cp client/src/translations/translations.ts server/src/

clean-db:
	@if [ -f server/database.sqlite ]; then \
		echo "Removing database file..."; \
		rm server/database.sqlite; \
		echo "Database file removed."; \
	else \
		echo "Database file does not exist. Nothing to remove."; \
	fi

clean: clean-db down
	docker system prune -a

fclean: clean
	rm -rf client/node_modules
	rm -rf server/node_modules
	@if [ $$(docker volume ls -q | wc -l) -gt 0 ]; then \
		docker volume rm -f $$(docker volume ls -q); \
	else \
		echo "No volumes to remove"; \
	fi

re: fclean all

.PHONY: all build up down dev clean fclean re copy-translation
