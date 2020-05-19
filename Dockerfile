FROM node:11.14.0 AS node
FROM hashicorp/terraform:0.12.15 as terraform
FROM centos:7

# Install Node
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
  ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Install Terraform
COPY --from=terraform /bin/terraform /usr/local/bin/terraform
