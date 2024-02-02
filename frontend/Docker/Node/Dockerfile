FROM node:21.5.0

RUN apt-get -q -y update \
    && apt-get -q -y install \
	git-core \
        vim \
        locales-all \
    && apt-get -q clean

RUN yarn global add serve

ENV LANG ja_JP.UTF-8

ENV LANGUAGE ja_JP:ja

ENV LC_ALL ja_JP.UTF-8

EXPOSE 3000