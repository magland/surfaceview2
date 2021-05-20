from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/surfaceview2-start-backend'
    ],
    install_requires=[
        'click',
        'hither',
        'google-cloud-storage',
        'paho-mqtt',
        'CacheControl'
    ]
)

# jinjaroot synctool exclude