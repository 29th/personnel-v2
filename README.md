# Personnel Setup

1. Create an account on [Cloud 9](http://c9.io)
2. Create a new workspace that is a clone of this repository
3. Using the terminal, run `source install.sh $IP $C9_USER`
4. After installation completes, turn on Cloud 9's web server by clicking **Run > Run With > Apache httpd**
5. Navigate to the `/repositories/forums` path provided in the installation success message
6. On the Vanilla installer, change the **Database Hos** from `localhost` to `0.0.0.0` and fill in an admin email, username, and password
7. It may bring you back to the installer screen afterwards, but if there's no error, you're good to go. Navigate to `/repositories/forums` again to verify you're logged in
8. Navigate to `/repositories/personnel-app/dist` to view the application
