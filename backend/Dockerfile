FROM node:18

# install system packages
RUN apt update && apt install -y nano curl \
    && rm -rf /var/lib/apt/lists/*

# create user
RUN useradd -m -s /bin/bash sandbox

# set working directory
WORKDIR /home/sandbox/app

# give ownership
RUN chown -R sandbox:sandbox /home/sandbox

# switch to non-root user
USER sandbox

# optional: better terminal prompt
RUN echo "PS1='\\w $ '" >> /home/sandbox/.bashrc

# start shell (for testing)
CMD ["bash"]
