# Personnel Setup
Easy way to get setup with a development environment for the personnel system on Windows, Mac, or Linux.

1. Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Download and install [Vagrant](https://www.vagrantup.com/downloads.html) (you'll need to restart your computer after)
3. Download and install git ([Windows](https://windows.github.com/) | [Mac](https://mac.github.com/) | [Linux](http://git-scm.com/download/linux))
4. Clone this repository by clicking **Clone in Desktop** on the right-hand side of this page. It doesn't matter where you clone it to, but remember where you do for the next step.
5. Open Git Shell **as an administrator** and navigate into the cloned repository via by typing `cd path/to/personnel` (this is usually `C:\Users\YOURNAME\Documents\Github\personnel`)
6. Execute this setup script by typing `vagrant up`
7. Wait a bit, until it says it's ready, then browse to [http://localhost:8080/forums/dashboard/setup](http://localhost:8080/forums/dashboard/setup)
8. Fill out the setup page - leave the database credentials alone and just enter an Admin email, username, and password

You should now be logged in as an administrative user when you go to [http://localhost:8080/personnel-app/app](http://localhost:8080/personnel-app/app)

You can edit the source code by opening the files inside the `personnel/repositories` directory.

## Proposing code changes
Once you've changed files or code and you want to submit that back, you need to do a pull request. Documentation on this is forthcoming...