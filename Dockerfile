FROM debian:bullseye as builder

ARG NODE_VERSION=18.4.0

RUN apt-get update; apt install -y curl
RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@${NODE_VERSION}

# ----------------

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV production

# Install dependencies - backend
RUN mkdir backend
COPY --chown=bullseye:bullseye backend/package.json backend
RUN cd backend && npm i

# Install dependencies - frontend
RUN mkdir frontend
COPY --chown=bullseye:bullseye frontend/package.json frontend
RUN cd frontend && npm i

# ----------------

# Build
COPY --chown=bullseye:bullseye . .
RUN cd backend && npm run build
RUN cd frontend && npm run build:prod


FROM debian:bullseye
COPY --from=builder /root/.volta /root/.volta
COPY --from=builder /app /app
ENV PATH /root/.volta/bin:$PATH

WORKDIR /app
ENV NODE_ENV production
ENTRYPOINT ["npm", "run", "start"]
