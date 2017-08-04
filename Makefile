
# Listing of Modules
packages := lib/agent/http lib/agent/ssh lib/agent/xterm
packages := ${packages} lib/backend/etcd
packages := ${packages} lib/middleware/docker lib/middleware/round-robin
packages := ${packages} lib/resolver/http lib/resolver/ssh

git_version := $(shell git tag | tail -1)

publish:
	for pkg in ${packages}; do \
		cd ./$$pkg; \
		npm version ${git_version}; \
		npm publish; \
		cd ../../../; \
	done

key-gen:
	mkdir -p local
	ssh-keygen -t rsa -b 4096 -C "Red Router" -f "./local/host.key" -N "";
