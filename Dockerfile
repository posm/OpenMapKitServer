FROM ubuntu:16.04
LABEL maintainer="Seth Fitzsimmons <seth@mojodna.net>"

ENV DEBIAN_FRONTEND noninteractive

RUN \
  apt update \
  && apt upgrade -y \
  && apt install -y --no-install-recommends \
    apt-transport-https \
    curl \
    software-properties-common \
  && curl -sf https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
  && add-apt-repository -y -u -s "deb https://deb.nodesource.com/node_6.x $(lsb_release -c -s) main" \
  && apt install -y --no-install-recommends \
    build-essential \
    default-jre-headless \
    git \
    nodejs \
    python \
    python-dev \
    python-pip \
    python-setuptools \
    python-wheel \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN \
  npm install -g yarn \
  && rm -rf /root/.npm

COPY requirements.txt /app/requirements.txt

WORKDIR /app

RUN \
  pip install -r requirements.txt

COPY package.json /app/package.json

RUN \
  yarn \
  && rm -rf /root/.cache/yarn

COPY . /app/

RUN \
  cd frontend && yarn \
  && yarn build

RUN \
  git submodule update --init \
  && useradd omkserver -m \
  && chown -R omkserver:omkserver /app/data

USER omkserver

VOLUME ["/app/data"]
EXPOSE 3210
ENV NODE_ENV production

CMD ["node", "server.js"]
