FROM node:14.17-alpine AS base
WORKDIR /app
COPY .npmrc /root
COPY certs.pem $HOME/certs.pem
RUN npm config delete cafile
ENV NODE_EXTRA_CA_CERTS="$HOME/certs.pem"
ENV NODE_ENV=production
COPY ["package.json", "yarn.lock", "entrypoint.sh", "./"]
RUN yarn install --production
COPY ["tsconfig.json", "tsconfig.build.json", "./"]
COPY src ./src
RUN yarn build

FROM node:14.17-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=base /app/dist ./src
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/entrypoint.sh ./entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
