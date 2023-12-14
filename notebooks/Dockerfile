FROM python:3.11.6-slim-bullseye

WORKDIR /usr/src/scripts

COPY ./scripts/*.py /usr/src/scripts
COPY ./scripts/production/helpers/ /usr/src/scripts/production/helpers/

COPY requirements.txt ./
RUN pip install -r requirements.txt

CMD ["python", "--version"]