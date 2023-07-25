FROM ubuntu:23.10

RUN apt-get update && \
    apt-get install -y python3 python3.11-venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir /notebooks
WORKDIR /notebooks
COPY ./notebooks/requirements.txt /notebooks
COPY ./notebooks/scripts /notebooks/scripts

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install -r requirements.txt

WORKDIR /notebooks/scripts

ENTRYPOINT ["papermill"]

CMD ["papermill", "--help"]