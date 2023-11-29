FROM python:3-slim

WORKDIR /usr/src/scripts

COPY ./notebooks/requirements.txt /usr/src/scripts
COPY ./notebooks/scripts/*.py /usr/src/scripts

RUN pip install -r requirements.txt

ENTRYPOINT ["python"]

CMD ["python", "--version"]