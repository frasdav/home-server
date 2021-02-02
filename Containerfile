FROM hashicorp/terraform:0.12.15 as terraform
FROM vmware/govc:v0.18 as govc
FROM mozilla/sops:4bc27f6eb72b1b4090753e9f3dba1d094544e1c3 as sops
FROM centos/python-36-centos7:20200514-897c8e3

USER root

# Install Node
RUN set -eux; \
  curl -sL https://rpm.nodesource.com/setup_14.x | bash - && \
  yum install -y nodejs-14.15.1

# Install Terraform
COPY --from=terraform /bin/terraform /usr/local/bin/terraform

# Install govc
COPY --from=govc /govc /usr/local/bin/govc

# Install sops
COPY --from=sops /go/bin/sops /usr/local/bin/sops

# Upgrade pip
RUN pip install --upgrade pip===20.1.1

# Install Ansible
RUN pip install ansible===2.9.9

# Install openshift
RUN pip install openshift===0.11.1

USER default

WORKDIR "/app"
