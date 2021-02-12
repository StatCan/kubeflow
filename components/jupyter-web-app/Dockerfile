# Stage 0: UI Build Stage
FROM node:10 as build-stage
#FROM node:10 as frontend

WORKDIR /app

COPY ./frontend/package*.json /app/
RUN npm install

COPY ./frontend/ /app/

# Download the source code for all third party libraries.
RUN npm install
# Build the default and rok frontends
RUN npm run build frontend -- --output-path=./dist/out/default --configuration=production
RUN npm run build frontend -- --output-path=./dist/out/rok --configuration=rok-prod

# Stage 2: Backend code and UI serving
FROM ubuntu:18.04

RUN apt-get update -y && \
    apt-get install -y apt-utils  build-essential curl wget\
	python-dev python3-pip \
    libssl-dev libffi-dev python3-bcrypt

# We copy just the requirements.txt first to leverage Docker cache
COPY ./backend/requirements.txt /app/requirements.txt

RUN pip3 install -r /app/requirements.txt

# Backend code
COPY ./backend/kubeflow_jupyter /app/kubeflow_jupyter
COPY ./backend/main.py /app/main.py
# Copy backend third party library licenses and source code if need.
COPY ./backend/third_party /app/third_party/backend
RUN wget https://github.com/certifi/python-certifi -O /app/third_party/backend/python-certifi

# Frontend code
COPY --from=build-stage /app/dist/out/default /app/kubeflow_jupyter/default/static/
COPY --from=build-stage /app/dist/out/rok /app/kubeflow_jupyter/rok/static/
# Copy frontend third party library licenses and source code.
COPY ./frontend/third_party /app/third_party/frontend
COPY --from=build-stage /app/node_modules /app/third_party/frontend/node_modules

WORKDIR /app/

ENTRYPOINT ["python3"]
CMD ["main.py"]
# Build the default frontends
#RUN npm run build frontend -- --output-path=./dist/out/default --configuration=production

# Stage 1: Build with the golang image
#FROM golang:1.14-alpine AS backend

# Add git
#RUN apk add git

# Set workdir
#WORKDIR /go/src/github.com/StatCan/jupyter-apis

# Add dependencies
#COPY go.mod .
#COPY go.sum .
#RUN go mod download

# Build
#COPY . .
#RUN CGO_ENABLED=0 go install .

# Generate final image
#FROM scratch
#COPY --from=frontend /app/dist/out/default /static/
#COPY --from=backend /go/bin/jupyter-apis /jupyter-apis
#ENV LISTEN_ADDRESS 0.0.0.0:5000
#EXPOSE 5000
#ENTRYPOINT [ "/jupyter-apis" ]
