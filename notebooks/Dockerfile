FROM ubuntu:23.10

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir /notebooks
WORKDIR /notebooks
COPY ./requirements.txt /notebooks

RUN pip3 install --no-cache-dir -r requirements.txt

ENTRYPOINT ["papermill"]

CMD ["papermill", "--help"]