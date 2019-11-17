# Nuxt Blog Cake

Simple, personal blogging server

[Video tutorial here](https://youtu.be/lZNgMfSHt74)

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
# Edit /etc/haproxy/haproxy.cfg
#     #---------------------------------------------------------------------
#     # main frontend which proxys to the backends
#     #---------------------------------------------------------------------
#     frontend  main *:80
#         acl url_static       path_beg       -i /static /images /javascript /stylesheets
#         acl url_static       path_end       -i .jpg .gif .png .css .js
#     
#         use_backend static          if url_static
#         default_backend             app
#     
#     #---------------------------------------------------------------------
#     # static backend for serving up images, stylesheets and such
#     #---------------------------------------------------------------------
#     backend static
#         balance     roundrobin
#         server      static 127.0.0.1:3000 check
#     
#     #---------------------------------------------------------------------
#     # round robin balancing between the various backends
#     #---------------------------------------------------------------------
#     backend app
#         balance     roundrobin
#         server  app1 127.0.0.1:3000 check

# Start!
sudo service haproxy start
pm2 start npm --name nuxt-blog-cake -- start
# Restarting the server
pm2 restart nuxt-blog-cake
# run some statistics on website visits
npm run stats
```

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
