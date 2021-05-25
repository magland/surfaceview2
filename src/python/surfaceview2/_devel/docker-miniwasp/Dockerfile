FROM ubuntu:18.04

#########################################
### Python                                                               
RUN apt update && apt -y install git wget build-essential
RUN apt install -y python3 python3-pip
RUN ln -s python3 /usr/bin/python
RUN ln -s pip3 /usr/bin/pip
RUN DEBIAN_FRONTEND=noninteractive apt install -y python3-tk

#########################################
### Numpy
RUN pip install numpy

#########################################
### Make sure we have python3 and a working locale
RUN rm /usr/bin/python && ln -s python3 /usr/bin/python && rm /usr/bin/pip && ln -s pip3 /usr/bin/pip
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'
RUN apt install -y locales && locale-gen en_US.UTF-8

#########################################
### gfortran
RUN apt update && apt install -y gfortran

#########################################
RUN mkdir /home/root
ENV HOME=/home/root
ENV LD_LIBRARY_PATH=$HOME/lib
RUN mkdir /repos

# lapack, blas
RUN apt update && apt install -y liblapack-dev libopenblas-dev

# python dependencies for hither
RUN pip install click simplejson requests

# FMM3D - 5/24/21
RUN git clone https://github.com/flatironinstitute/FMM3D /repos/FMM3D \
    && cd /repos/FMM3D \
    && git checkout 3552b89086d8df5c3c235a29608e0b973a3206f0 \
    && make install
RUN cd /repos/FMM3D && make python

# fmm3dbie - 5/24/21
RUN git clone https://gitlab.com/fastalgorithms/fmm3dbie /repos/fmm3dbie \
    && cd /repos/fmm3dbie \
    && git checkout 3d8ff177b795d148840f28456253d281f2960928 \
    && make install
RUN cd /repos/fmm3dbie && make python

# miniwasp - 5/24/21
RUN git clone https://github.com/mrachh/miniwasp /repos/miniwasp \
    && cd /repos/miniwasp \
    && git checkout 97fd0d405d76277d72f6c0f73fe62de1087993ec \
    && make python

COPY test_data /test_data
ENV TEST_DATA_DIR=/test_data


LABEL version="0.1.5"