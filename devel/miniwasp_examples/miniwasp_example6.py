#!/usr/bin/env python3

from typing import cast

# import field_slicer as fs
import hither2 as hi
import kachery_p2p as kp
import numpy as np
from surfaceview2._devel.example6_hither import example6_hither
import surfaceview2

def run_example6():
    import kachery_p2p as kp
    job_cache = hi.JobCache(feed_name='job-cache')
    with hi.Config(use_container=True, show_console=True, job_cache=job_cache):
        j: hi.Job = example6_hither.run()
        x = j.wait().return_value
        print(x)
        uri = kp.store_pkl(x)
        print(uri)

def main():
    run_example6()

if __name__ == '__main__':
    main()
