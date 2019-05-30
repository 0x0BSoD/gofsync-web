# STEP 1
FROM alpine:3.7 as JSbuilder

RUN apk add --update nodejs
RUN mkdir -p /tmp/vue-app
WORKDIR /tmp/vue-app
COPY . .
RUN npm install
RUN npm run build

# STEP 2
FROM scratch
COPY --from=JSbuilder /tmp/vue-app/dist /srv/
