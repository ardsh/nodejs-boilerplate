SHELL := /bin/bash

REGISTRY ?= registry
PACKAGE  ?= $(shell more package.json | awk '/"name":/ {{gsub(/[",]/, "")} print $$2; exit}')
NODE_ENV ?= production

VERSION ?= $(shell more package.json | awk '/"version":/ {{gsub(/[",]/, "")} print $$2}')

export VERSION
export NODE_ENV

DOCKER_IMAGE  ?= $(REGISTRY)/$(PACKAGE):$(VERSION)

build:
	docker build -t '$(DOCKER_IMAGE)' -f Dockerfile .

push:
	docker push '$(DOCKER_IMAGE)'

shell:
	docker run --rm -it --entrypoint /bin/sh $(DOCKER_IMAGE)

run:
	docker run --rm $(DOCKER_IMAGE)

push-latest:
	docker tag '$(DOCKER_IMAGE)' '$(REGISTRY)/$(PACKAGE):latest'
	docker push '$(REGISTRY)/$(PACKAGE):latest'

.PHONY: build push run shell
