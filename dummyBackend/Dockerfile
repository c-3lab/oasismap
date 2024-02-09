FROM python:3.8.2

ENV LC_ALL=C.UTF-8 \
    LANG=C.UTF-8

ADD Pipfile* /tmp/
RUN cd /tmp && \
    pip install -U pip && \
    pip install pipenv && \
    pipenv install --system