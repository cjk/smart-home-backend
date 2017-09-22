.PHONY: _pwd_prompt decrypt_conf encrypt_conf

CONF_FILE=src/config/group-address-list.js

# 'private' task for echoing instructions
_pwd_prompt:
	@echo "Contact cjk@pobox.com for the password."

# to create app/config/group-address-list.js
decrypt_conf: _pwd_prompt
	openssl cast5-cbc -d -in ${CONF_FILE}.cast5 -out ${CONF_FILE}
	chmod 600 ${CONF_FILE}

# for updating src/config/group-address-list.js.cast5
encrypt_conf: _pwd_prompt
	openssl cast5-cbc -e -in ${CONF_FILE} -out ${CONF_FILE}.cast5
