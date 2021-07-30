# Nuxt Blog Cake

Simple, personal blogging server

[Video tutorial here](https://youtu.be/lZNgMfSHt74)

## 2.0 Migration
The site is broken on the older packages so I made a completely new app through Nuxt and migrated all the code over and fixed it up to work with the new packages. The major changes are in the server folder, so as long as you did not hack in your own features you should be able to follow these steps to use the new version:

* Clone this repository into its own folder
* Copy your database.sqlite file to the new cloned repository in the same location 
* Copy your pages/staging and pages/post folders into the new cloned repository in the same locations. Delete the existing folders in the cloned repository 
* Replace the cloned layouts folder with your own layouts folder
* Replace the components folder with your own components folder
* Replace the assets folder with your own assets fodler
* Replace the static folder with your own static folder
* Replace the .env file with your own .env
* Re-run setup commands such as "npm install"

A build extension has been made so that Nuxt won't complain about feed blocks in the vue files. You can see it in the `nuxt.config.js` build property in case it causes an issue somehow.

## Setup on AWS EC2
```bash
NPM_VERSION="10.15.3"
sudo yum update -y
# Install nvm 
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. ~/.nvm/nvm.sh
# Use "nvm ls-remote" to find the version you want to install
nvm install ${NPM_VERSION}
# after going to the directory where the server is in...
npm install 
npm run build
# Install pm2 for persistent running
npm install -g pm2 
# Install haproxy and route from port 80 to 3000
sudo yum install haproxy -y
# Edit /etc/haproxy/ha#proxy.cfg
#        frontend main 
#            bind :80
#            acl url_static       path_beg       -i /static /images /javascript /stylesheets
#            acl url_static       path_end       -i .jpg .gif .png .css .js
#
#            use_backend static          if url_static
#            default_backend             app
#
#        #---------------------------------------------------------------------
#        # static backend for serving up images, stylesheets and such
#        #---------------------------------------------------------------------
#        backend static
#            balance     roundrobin
#            server      static 127.0.0.1:3000 check
#
#        #---------------------------------------------------------------------
#        # round robin balancing between the various backends
#        #---------------------------------------------------------------------
#        backend app
#            balance     roundrobin
#            server  app1 127.0.0.1:3000 check

# Start!
sudo service haproxy start
pm2 start npm --name nuxt-blog-cake -- start
# Restarting the server
pm2 restart nuxt-blog-cake
# run some statistics on website visits
npm run stats
```

## Setup Elsewhere
I've noticed that the build may not function correctly on Ubuntu or CentOS systems. If this is the case, then my recommendation is to build the project on your own computer first, making sure your environment variables are already set up correctly for the target computer, then transfer the folder of the project to the desired location and run the project there. Don't run `npm build` after you transfer it, but do run an `npm install`!

## Useful Commands (from [Nuxt](https://nuxtjs.org)).

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```
