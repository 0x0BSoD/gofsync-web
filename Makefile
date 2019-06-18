build:
	yarn build
	tar czvf goFsyncWeb.tar.gz dist
	mv goFsyncWeb.tar.gz gofsyncweb_1.3.tar.gz
	scp gofsyncweb_1.3.tar.gz root@sjc01-c01-pds10.c01.ringcentral.com:/opt/goFsync
