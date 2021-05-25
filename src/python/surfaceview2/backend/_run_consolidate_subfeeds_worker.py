import time
from typing import Dict
import kachery_p2p as kp
from multiprocessing.connection import Connection
from ._common import _pathify_hash, _download_json_from_google_cloud, _upload_json_to_google_cloud

class SubfeedForConsolidating:
    def __init__(self, feed_id: str, subfeed_hash: str):
        self._feed_id = feed_id
        self._subfeed_hash = subfeed_hash
        self._check_needed = False
        self._last_check_timestamp = time.time()
    def update(self):
        self._check_needed = True
    @property
    def check_needed(self):
        return self._check_needed
    @property
    def elapsed_since_last_check(self):
        return time.time() - self._last_check_timestamp
    def check(self, google_bucket_name: str):
        self._check_needed = False
        self._last_check_timestamp = time.time()
        p = f'feeds/{_pathify_hash(self._feed_id)}/subfeeds/{_pathify_hash(self._subfeed_hash)}/subfeed.json'
        subfeed_json = _download_json_from_google_cloud(google_bucket_name, p)
        if subfeed_json is None:
            return
        message_count = subfeed_json['messageCount']
        consolidated_count: int = subfeed_json.get('consolidatedCount', 0)
        if consolidated_count <= message_count - 5:
            sf = kp.load_subfeed(f'feed://{self._feed_id}/~{self._subfeed_hash}')
            consolidated_messages = []
            while True:
                msg = sf.get_next_message(wait_msec=0, signed=True)
                if msg is None: break
                consolidated_messages.append(msg)
            if len(consolidated_messages) < message_count:
                print(f'WARNING: unexpected not enough messages: {len(consolidated_messages)} < {message_count}')
                return
            consolidated_messages = consolidated_messages[:message_count]
            object_name = f'feeds/{_pathify_hash(self._feed_id)}/subfeeds/{_pathify_hash(self._subfeed_hash)}/0-{message_count - 1}'
            _upload_json_to_google_cloud(google_bucket_name, object_name, consolidated_messages, replace=False)
            
            # download again to be sure we have latest version
            subfeed_json = _download_json_from_google_cloud(google_bucket_name, p)
            if subfeed_json is None:
                print(f'WARNING: unexpected subfeed_json is none during message consolidation')
                return
            subfeed_json['consolidatedCount'] = message_count
            _upload_json_to_google_cloud(google_bucket_name, p, subfeed_json, replace=True) # maybe a race condition here. :(

def _run_consolidate_subfeeds_worker(pipe_to_parent: Connection, google_bucket_name: str):
    subfeeds_for_consolidating: Dict[str, SubfeedForConsolidating] = {}
    while True:
        while pipe_to_parent.poll():
            x = pipe_to_parent.recv()
            if isinstance(x, str):
                if x == 'exit':
                    return
                else:
                    print(x)
                    raise Exception('Unexpected message in _run_consolidate_subfeeds_worker')
            elif isinstance(x, dict):
                type0 = x['type']
                if type0 == 'update_subfeed':
                    feed_id = x['feed_id']
                    subfeed_hash = x['subfeed_hash']
                    code = feed_id + '/' + subfeed_hash
                    if code not in subfeeds_for_consolidating:
                        subfeeds_for_consolidating[code] = SubfeedForConsolidating(feed_id=feed_id, subfeed_hash=subfeed_hash)
                    x = subfeeds_for_consolidating[code]
                    x.update()
            else:
                print(x)
                raise Exception('Unexpected message in _run_consolidate_subfeeds_worker')
        for k, v in subfeeds_for_consolidating.items():
            if v.check_needed and (v.elapsed_since_last_check > 10):
                v.check(google_bucket_name)
        time.sleep(0.1)
    
