FROM ubuntu:20.04

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/

RUN apt-get update -y --fix-missing && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get install -y python3-pip && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y antiword unoconv wget build-essential cmake libfreetype6-dev pkg-config libfontconfig-dev libjpeg-dev libopenjp2-7-dev ffmpeg libsm6 libxext6 && \
    apt-get install -y poppler-utils && \
    apt-get install -y tesseract-ocr && \
    export JAVA_HOME && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the global index-url for pip
RUN pip config set global.index-url https://pypi.org/simple/

# Create work directory
WORKDIR /app/

# First only copy the requirements.txt file to avoid cache invalidation by other file changes
COPY requirements.txt /app/
# Install Python dependencies
RUN pip3 install -r requirements.txt

# Now copy the rest of the codebase into the image
COPY . /app/

# Make entrypoint script executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1