# Personnel Setup

1. Go to the following repositories and click **Fork** in the top-right corner to create your own forks
    1. [29th/personnel-api](https://github.com/29th/personnel-api)
    2. [29th/personnel-app](https://github.com/29th/personnel-app)
    3. [29th/vanilla](https://github.com/29th/vanilla)
2. Create an account on [Cloud 9](http://c9.io) using GitHub to authenticate (or create a new login and authenticate with GitHub on the dashb0ard)
3. Click **Create new workspace** and select **Clone from URL**. When it's finished, select it and click **Start Editing** to open the workspace
4. Use the clone URL found on the right-hand side of this repository and click **Create**
5. Using the terminal at the bottom of the workspace, run the following command, replacing `YOUR_GITHUB_USERNAME` with your GitHub username:
```bash
$ source install.sh YOUR_GITHUB_USERNAME
```
6. When the installation finishes, you'll get an **Installation complete!** message with a URL to navigate to. Copy that into a new browser tab to navigate to it. (Note: Make sure `:80` is not added to the URL after you paste it)
7. On the Vanilla installer, change the **Database Host** from `localhost` to `0.0.0.0` and fill in an admin email, username, and password (Note: It may bring you back to the installer screen afterwards, but if there's no error, you're good to go.)
8. Navigate to the **Installation complete!** URL again to verify you're logged in
9. Navigate to `https://<your site url>/repositories/personnel-app/dist` to view the application
