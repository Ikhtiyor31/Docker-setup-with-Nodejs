
docker setup

1. create Dockerfile 
    1. specify node version, any version you want
        --> FROM node: 15 
    2. set working directory whre you run all commands, it's optional, but it's highly recommended
        --> WORKDIR /app
    3. copy package.json to docker node image which we're gonna build
        --> COPY package.json .(current dir in docker)
    4. next, run npm install, so it's gonna install all packages in our image in docker
        --> RUN npm install
    5. copy . (current dir) ./ (to docker image)
        COPY . ./
    6. to expose 4000, port forwarding
        EXPOSE 4000
    7. to tell what command to run, when we build image, it's gonna run these command
        CMD ['node', 'app.js']
    // docker run these commands and cache results 
2. next, we're gonna build docker image, write these command and run
    1. docker build .
    2. docker image ls // to check image in docker con

    3. docker image prune // to remove unnecessary image from docker container 

    4. docker image rm IMAGE_ID // to remove specific image from docker

    4. docker buld -t node-app-image . // to build docker image with specific namge flag

    5. to check running image
        docker ps
 
    5. so, we're gonna run currently built image
        docker run --name node-app node-app-image
        refresh page, unfortunately docker doesn't know that port, so we need to forward localhost port to docker port to run 
     6. to to forward localhost port to docker port
        docker run -p 4000:4000 -d --name node-app node-app-image

3. next, we create dockerignore file not copy all files from local machine to docker container 
    1. write name of files that you want to exclude in docker container ex (Dockerfile, .dockerignore)

4. and, we're gonna make use of volume, which allows us to have persistant data of file system in our doc container
        that's special volume, what it allows us to is t o sync local machine file with docker container files 
        so, we don't need build and run docker every time when we make changes to local machine files.
        docker run -v  pathtofolderonlocation:pathtofolderoncontainer -p 4000:4000 -d --name node-app node-app-image.
    1. docker run -v %c%:/app -p 4000:4000 -d --name node-app node-app-image ( in Windows)
        docker run -v ${pwd}:/app -p 4000:4000 -d --name node-app node-app-image (windows power shell)
        docker run -v $(pwd):/app -p 4000:4000 -d --name node-app node-app-image (mac or linux)
        
    2. next, we have to restart node process, to make automatically happen 
        npm install nodemon
        and change package.json part here 
            ->  "scripts": {
                "start": "node app.js",
                "dev": "nodemon app.js"
            },
    3. change CMD ["node", "app.js"] to CMD ["npm", "run", "dev"] in Dockerfile

    4. remove node_modules in local machine, which we don't need anymore, but prevent node_modules         from  docker container 
            to keep node_modules in docker container, what we're gonna do 
        docker run -v $(pwd):/app -v /app/node_modules/ -p 4000:4000 -d --name node-app node-app-image

    5. in bind mount, whenever we make change to files in local machine, it affects files in docker container, 
        and whenever we make changes to files(create, delete) in docker, it's gonna affect files to local machine 
            it's kind of potential issue, so we need to make docker container read-mode-only     
        docker run -v $(pwd):/app:ro -v /app/node_modules -p 4000:4000 -d --name node-app node-app-image
     
    6. to override port in Dockerfile
        ->  ENV PORT 4000
            EXPOSE ${PORT}
        -> docker run -v $(pwd):/app:ro -v /app/node_modules --env PORT=4000 -p 4000:4000 -d --name node-app node-app-image
 5. create .evn to store environment variables, we can pash as many envariables as we want but it's kind of exhausting process, instead create .env file to so.
    1. create .env file, write your environment variables there 
    
    2. to check volume 
        --> docker volume ls 

    3. to delete unnecessary volumes 
        --> docker volume prune 
        
6. to run multiple container in docker
    1. create docker-compose.yml 

    2. specify docker-compose version 
        --> version: "3"
    3. specify services ex. backend, frontend, mysql, mongo etc. be careful spacing matters
    4. we're gonna buld Dockerfile 
        --> build .
    5. we do need to expose port
        --> ports:
                - "4000:4000" // - signify list
    6. we're gonna pass all volumes 
        volumes: 
            - ./:/app
            - /app/node_modules
    6. next, we want to add list of environment variables
        environment:
            - PORT=4000

    7. to build image
        --> docker-compose up -d  
    8. to turn down 
        --> docker-compose down -v (with volume)    
    9. to rebuild brand new image 
        --> docker-compose up -d --build 
 7. next, we're gonna create different docker files, one for production and one for development
    1. create docker-compose.dev.yml and write these command 
        services:
            node-app:
                build: .
                volumes:
                - ./:/app
                - /app/node_modules
                environment:
                - NODE_ENV=development
                command: npm run dev
    2. create docker-compose.prod.yml and write these commands  
        version: '3'
            services:
            node-app:
                environment:
                - NODE_ENV=production
                command: node app.js       
    3. docker-compose.yml file as it is                
        version: '3'
            services:
            node-app:
                build: .
                ports:
                - "4000:4000"
                environment:
                - PORT=4000
    4. to run in developemnt mode
        --> docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

    5. to turn it down 
        --> docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v

    6. to run in production mode
        --> docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    7. to rebuild brand new image 
        --> docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build 
    8. to ignore docker-compose* files to in docker container 
        --> include in .dockerignore file --> docker-compose*
8. next, we're gonna create mongodb service 
    1. name service: 
        --> mongo:
                image: mongo
                environment:
                - MONGO_INITDB_ROOT_USERNAME=ikhtiyor
                - MONGO_INITDB_ROOT_PASSWORD=12345            

    2. build image again, now it's gonna build with new mongo services

    3. if we rebuild, turn down and up again, we lose data in mongo db, so this is major problem 
        we don't want to lose data in mongdb
    4. so, let's create named volume for mongodb 
        volumes:
            - mongo-db: /data/db
    5. -v is another issue, because it might delete all volumes in our container, so we can't use -v flag anymore 
        --> use prune command instead, which removes all unnecessary volumes, [run this command in running mode]
    
    6. npm install mongoose --save to install mongo 

    7. to connect mongo db, get ip address of mongo container from docker 
        --> docker inspect container_id
        --> get IPAddress from Networks seciont
        const mongoose = require('mongoose')
        mongoose.connect('mongodb://username:password@ip_address:27017/?authSource=admin').then( ()=> console.log("connected to db")).catch( (err)=> 
            console.log(err) )
        in my case, mongoose.connect('mongodb://ikhtiyor:12345@192.168.128.2:270127/?authSource=admin')
    8. but, we don't want to get ip address every time when we run docker because ip address changes. so what we're gonna do is 
            if one container wants to talk another container, we can use the name of that container or name of that service name thanks to dns
            --> so we can use mongo instead of ip address
            so we're gonna use [mongo] 
            --> mongodb://"ikhtiyor:12345@mongo:27017/?authSource=admin
    9. next, mongo should run as long as node runs 
        --> so we have to make node to depend on mongo
            in node-ap
                depends_on:
                    - mongo
            --> mongo is gonna run first thanks to usage of depends_on   
9. how to setup redis in this section 
    1.  // install these dependencies 
        --> first, npm install redis connect-redis express-session --save 
    2. import these to varible 
        const session = require('express-session')
        const redis = require('redis')
        let RedisStore = require('connect-redis')(session)
    3. import REDIS_URL and REDIS_PORT to node-app --> environment
                                                            --> - REDIS_    
        let redisClient = redis.createClient({
            host: REDIS_URL,
            port: REDIS_PORT
        })

    4. 
        app.use(
            session({
                store: new RedisStore({client: redisClient}),
                secret: SESSION_SECRET,
                cookie: {
                    secure: false,
                    httpOnly: true,
                    maxAge: 30000
                },
                resave: false,
                saveUninitialized: false,
            })
        );    
    5. to test it, 
        --> req.session.user = req.body.username;
        check it from redis server in docker by redis-cli
        keys * 
        (user)
        get user
        see output
10. how to push github 
    1. create repository in github (any name you want ) mine is Docker-setup-with-Nodejs

    2. echo "# Docker-setup-with-Nodejs" >> README.md
        git init
        git add README.md
        git commit -m "first commit"
        git branch -M main
        git remote add origin https://github.com/Ikhtiyor31/Docker-setup-with-Nodejs.git
        git push -u origin main