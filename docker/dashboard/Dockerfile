FROM node:12

# required for cypress
RUN apt-get update && \
  apt-get install --no-install-recommends -y \
  libgtk2.0-0 \
  libgtk-3-0 \
  libnotify-dev \
  libgconf-2-4 \
  libnss3 \
  libxss1 \
  libasound2 \
  libxtst6 \
  xauth \
  xvfb \
   # clean up
  && rm -rf /var/lib/apt/lists/*

# yarn
RUN curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
RUN yarn global add @angular/cli
