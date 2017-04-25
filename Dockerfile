FROM mhart/alpine-node:7

RUN mkdir -p /var/app
WORKDIR /var/app

## Install deps
ADD package.json ./package.json
RUN npm install 

ADD index.js ./index.js

CMD ["node", "./index"]
