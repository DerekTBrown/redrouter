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
	npm version patch;
	npm publish;
	cd "../../../";
done

# Publish Core
pwd;
git add -A;
git commit . -m "Updating Package Versions";
npm version patch;
npm publish;
