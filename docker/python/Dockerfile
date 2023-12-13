FROM python:3.11.6-slim-bullseye

WORKDIR /usr/src/scripts

COPY ./notebooks/requirements.txt /usr/src/scripts
COPY ./notebooks/scripts/*.py /usr/src/scripts
COPY ./notebooks/scripts/helpers/ /usr/src/scripts/helpers/

RUN pip install -r requirements.txt

ENTRYPOINT ["python"]

CMD ["python", "--version"]