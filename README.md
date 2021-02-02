# home-server

## Running govc commands
```bash
docker run -ti -e GOVC_INSECURE=1 -e GOVC_URL=$VCENTER_SERVER -e GOVC_USERNAME=$VCENTER_USERNAME -e GOVC_PASSWORD=$VCENTER_PASSWORD -e GOVC_DATASTORE=$VCENTER_DATASTORE -e GOVC_NETWORK=$VCENTER_NETWORK -e GOVC_RESOURCE_POOL=$VCENTER_RESOURCE_POOL -e GOVC_DATACENTER=$VCENTER_DATACENTER vmware/govc [COMMAND]
```

## Installing pip dependencies

```bash
ARCHFLAGS="-arch x86_64" LDFLAGS="-L/usr/local/opt/openssl/lib" CFLAGS="-I/usr/local/opt/openssl/include" pipenv install
```
