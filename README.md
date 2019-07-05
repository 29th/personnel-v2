# Personnel Setup

Create a directory called `personnel` and clone the three relevant repositories inside it.

```bash
git clone git@github.com:29th/personnel-api.git
git clone git@github.com:29th/personnel-app.git
git clone --recursive -b 29th-extensions-2.2.1 git@github.com:29th/vanilla.git
```
> Note the `vanilla` repo is cloned recursively to include the theme and plugins, which are
> linked repositories, and checks out our latest custom branch.

Copy [`docker-compose.yml`](docker-compose.yml) into your local `personnel` directory.

Create a directory `personnel/db` and put `personnel.sql` and `vanilla.sql` inside it.
You can get these from a 29th administrator.

Run `docker-compose up`. This will take several minutes the first time as it must download
the underlying images (php, node, etc.) and load the `.sql` backups (the .sql backup takes a while).
It's ready when you finally see a line that says:

```
db-vanilla_1    | 2019-07-05 15:00:28 1 [Note] mysqld: ready for connections.
```

Browse to `http://localhost:8082/dashboard/setup` and complete the forum setup wizard.
Set the `Database Host` to `db-vanilla` and set the admin information to whatever you like.

You're done! The site is live at the following URLs:

* app: `localhost:8080`
* api: `localhost:8081`
* vanilla: `localhost:8082`

You can edit files locally and you should see them reflected in the containers. If you need to
execute something in the containers, you can SSH in via `docker-compose exec [container-name] bash`.
