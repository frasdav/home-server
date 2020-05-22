FROM node:11.14.0 AS node
FROM hashicorp/terraform:0.12.15 as terraform
FROM vmware/govc:v0.18 as govc
FROM centos:7

# Install Node
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
  ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Install Terraform
COPY --from=terraform /bin/terraform /usr/local/bin/terraform

# Install govc
COPY --from=govc /govc /usr/local/bin/govc

# Install pwsh
RUN curl https://packages.microsoft.com/config/rhel/7/prod.repo | tee /etc/yum.repos.d/microsoft.repo && \
  yum install -y powershell

# Install PowerCLI
RUN pwsh -Command Install-Module -Name VMware.PowerCLI -Scope CurrentUser -Force && \
  pwsh -Command Set-PowerCLIConfiguration -Scope User -ParticipateInCEIP \$false -Confirm:\$false
