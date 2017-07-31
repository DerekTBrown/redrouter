
# Listing of Modules
packages := lib/agent/http lib/agent/ssh lib/agent/xterm
packages := ${packages} lib/backend/etcd
packages := ${packages} lib/middleware/docker lib/middleware/round-robin
packages := ${packages} lib/resolver/http lib/resolver/ssh

publish:
	npm version from-git;
	for pkg in ${packages}; do \
		npm --prefix=$$pkg version from-git; \
	done

key-gen:
	mkdir -p local
	ssh-keygen -t rsa -b 4096 -C "Red Router" -f "./local/host.key" -N "";
