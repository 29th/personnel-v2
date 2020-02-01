# Personnel v2 Setup

Contains the configurations and instructions to string together the personnel system and forums, both in development and in production.

## Local development

### Prerequisites

- [Git][git], for version control
- [Docker][docker], to run the applications
- [mkcert][mkcert], to generate local SSL certificates (or some other tool)
- A database dump of the personnel and vanilla databases, obtained from a 29th admin
- A copy of the `uploads` directory from the forums (optional)

### Installation

Clone this repository.

```
git clone https://github.com/29th/personnel.git
```

Navigate inside the directory that's created and clone the individual application repositories within it.

```
cd personnel
git clone -b vanilla-3.3 https://github.com/29th/personnel-api.git
git clone https://github.com/29th/personnel-app.git
git clone https://github.com/29th/forums.git
```

> Note that these instructions are for using Vanilla 3.3, which is not yet in production at the time of this writing. To use the version that's in production, use the `vanilla` repository isntead of `forums`, with special flags when cloning.
> 
> ```
> git clone --recursive -b 29th-extensions-2.1.11 https://github.com/29th/vanilla.git forums
> ```

Place the 2 database dump files in the `db` directory. They should be named `personnel.sql` and `vanilla.sql`.

Optionally, create an `uploads` directory containing the user image uploads from the forums.

Generate a locally-signed SSL certificate using mkcert. This generates two files, which should both end up in the `certs` directory.

```
mkcert -cert-file certs/29th.local.crt -key-file certs/29th.local.key 29th.local "*.29th.local"
```

You should end up with a directory structure like this:
```
personnel
├── forums/
├── personnel-api/
├── personnel-app/
├── db/
|   ├── personnel.sql
|   └── vanilla.sql
├── certs/
|   ├── 29th.local.crt
|   └── 29th.local.key
├── uploads/ # optional
├── docker-compose.yml
└── ...
```

Modify your hosts file so our desired hostnames point to your local machine. Add this line to it:

```
127.0.0.1 29th.local www.29th.local api.29th.local personnel.29th.local forums.29th.local
```

### Usage

Once installed, bring everything up with one command:

```
docker-compose up
```

This will take several minutes the first time you run it, as it must download the underlying images (php, node, etc.) and load the database dumps. It should be ready when you see a line from the `forums` container noting the database import is complete:

```
db-forums    | 2019-07-05 15:00:28 1 [Note] mysqld: ready for connections.
```

You can access the application at the hostnames you setup:

* https://www.29th.local
* https://api.29th.local
* https://personnel.29th.local
* https://forums.29th.local

You can edit application files in the `personnel-api` and `personnel-app` directories locally and you should see the changes reflected in the containers. If you need to execute something in the containers, you can SSH in using:

```
docker-compose exec <service-name> bash
# for example:
docker-compose exec api bash
```

To bring everything down, press `CTRL+C`. If that responds with 'Aborted', you can run:

```
docker-compose down
```

This will maintain the database contents. To destroy the database contents as well, include the flag to bring down volumes:

```
docker-compose down -v
```

[git]: https://desktop.github.com/
[docker]: https://docs.docker.com/install/
[mkcert]: https://github.com/FiloSottile/mkcert
