FROM python:3.11.6-bullseye

WORKDIR /usr/src/scripts
# TODO: Update copy path when finished
# COPY ./notebooks/requirements.txt /notebooks

COPY ./scripts/*.py /usr/src/scripts

COPY requirements.txt ./
RUN pip install -r requirements.txt

ENTRYPOINT ["python"]

CMD ["python", "--version"]