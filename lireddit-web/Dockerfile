
#copy files in image & install deps
FROM node:current-alpine AS base

WORKDIR /base
COPY yarn.lock ./
COPY package.json ./
RUN yarn install --frozen-lockfile
COPY . .

#copy files from base image & build using args
FROM base as build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production
WORKDIR /build
COPY --from=base /base ./
RUN yarn build

#copy output from build image, install next & execute
FROM node:current-alpine as production
ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /build/package.json ./
COPY --from=build /build/yarn.lock ./
COPY --from=build /build/.next ./.next
RUN yarn add next

EXPOSE 3000
CMD yarn start