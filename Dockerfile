FROM node:11.14.0 AS node
FROM hashicorp/terraform:0.12.15 as terraform
FROM vmware/govc:v0.18 as govc
FROM centos/python-36-centos7:20200514-897c8e3

USER root

# Install Node
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
  ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Install Terraform
COPY --from=terraform /bin/terraform /usr/local/bin/terraform

# Install govc
COPY --from=govc /govc /usr/local/bin/govc

# Upgrade pip
RUN pip install --upgrade pip===20.1.1

# Install Ansible
RUN pip install ansible===2.9.9

USER default

ENTRYPOINT ["/bin/bash"]