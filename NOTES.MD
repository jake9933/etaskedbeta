Depolyment:

```
npm install
sudo service postgresql start
createdb etasked
knex migrate:latest
knex seed:run
```

```
sudo ssh -i etasked.pem ubuntu@IP
sudo apt-get update
npm install knex --save
sudo apt install node-gyp
node-gyp rebuild
```

1. https://www.digitalocean.com/community/tutorials/how-to-use-npm-to-manage-node-js-packages-on-a-linux-server
2. https://tecadmin.net/install-postgresql-server-on-ubuntu/
3. http://suite.opengeo.org/docs/latest/dataadmin/pgGettingStarted/firstconnect.html

```
sudo -u postgres psql postgres
\password postgres
```

4. https://meteor-postgres.readthedocs.io/en/latest/migrations/

```
sudo node server.js
```

*Uses port 80.*

sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo apt-get install iptables-persistent

screen sudo node server.js
CTRL A + D

*Detach screen, keep running.*