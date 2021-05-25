import json
from typing import Union
import requests
from google.cloud import storage

def _http_json_post(url: str, obj: dict):
    r = requests.post(url, json=obj)
    try:
        assert r.status_code == 200, f'Problem posting data to: {url}: {str(r)}'
        return r.json()
    finally:
        r.close()
class _global:
    storage_client: Union[storage.Client, None] = None

def _upload_json_to_google_cloud(bucket_name: str, destination_name: str, data: Union[list, dict, float, int, str], *, replace=True):
    if _global.storage_client is None:
        _global.storage_client = storage.Client()
    bucket = _global.storage_client.bucket(bucket_name)
    if not replace:
        if bucket.get_blob(destination_name) is not None:
            return

    blob = bucket.blob(destination_name)

    blob.upload_from_string(json.dumps(data).encode('utf-8'))

def _download_json_from_google_cloud(bucket_name: str, source_name: str):
    if _global.storage_client is None:
        _global.storage_client = storage.Client()
    bucket = _global.storage_client.bucket(bucket_name)
    blob = bucket.get_blob(source_name)
    if blob is None: return None
    return json.loads(blob.download_as_string())

def _pathify_hash(x: str):
    return f'{x[0]}{x[1]}/{x[2]}{x[3]}/{x[4]}{x[5]}/{x}'
