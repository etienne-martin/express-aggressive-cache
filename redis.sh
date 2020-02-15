# Run docker-compose only if redis is not already running
if [[ $(docker ps -a|grep express-aggressive-cache-redis) ]];
then if [[ $(docker inspect -f {{.State.Running}} express-aggressive-cache-redis) == "false" ]];
     then docker rm express-aggressive-cache-redis && docker-compose up -d;
     fi
else docker-compose up -d;
fi
