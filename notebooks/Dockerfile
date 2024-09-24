FROM python:3.11.6-slim-bullseye AS build

WORKDIR /usr/src/scripts

COPY ./scripts/*.ipynb /usr/src/scripts

RUN pip install jupyter nbconvert

RUN jupyter nbconvert --to script /usr/src/scripts/*.ipynb

RUN rm /usr/src/scripts/*.ipynb

FROM python:3.11.6-slim-bullseye AS run

WORKDIR /usr/src/scripts

COPY --from=build /usr/src/scripts /usr/src/scripts

COPY ./requirements.txt /usr/src/scripts/
COPY ./scripts/helpers/ /usr/src/scripts/helpers/

RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["python"]

CMD ["python", "--version"]