.PHONY: lint format serve

lint:
	npm run lint

format:
	npm run lint -- --fix

serve:
	npm run dev
