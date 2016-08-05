#!/bin/bash
packages=(
	"agent/http"
  "agent/ssh_proxy"
	"agent/wetty"
	"backend/etcd"
	"middleware/docker"
	"middleware/round-robin"
	"resolver/http"
	"resolver/ssh"
)

# Publish Components
for i in "${packages[@]}"
do
	cd "lib/$i";
	pwd;
	npm publish;
	cd "../../../";
done

# Publish Core
pwd;
npm publish;
