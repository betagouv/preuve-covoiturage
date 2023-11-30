FROM python:3-slim

WORKDIR /usr/src/scripts

COPY ./notebooks/requirements.txt /usr/src/scripts
COPY ./notebooks/scripts/*.py /usr/src/scripts
COPY ./notebooks/scripts/production/computes/ /usr/src/scripts/production/computes/
COPY ./notebooks/scripts/production/filters/ /usr/src/scripts/production/filters/

RUN pip install -r requirements.txt

ENTRYPOINT ["python"]

CMD ["python", "--version"]