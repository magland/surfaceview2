#!/usr/bin/env python3

from typing import cast

import field_slicer as fs
import hither2 as hi
import kachery_p2p as kp
import numpy as np
from surfaceview2._devel.example4_hither import example4_hither

def run_example4():
    import kachery_p2p as kp
    geom_uri = 'sha1://fce1fb4c8637a36edb34669e1ac612700ce7151e/lens_r01.go3'
    job_cache = hi.JobCache(feed_name='job-cache')
    with hi.Config(use_container=True, show_console=True, job_cache=job_cache):
        j: hi.Job = example4_hither.run(geom_uri=geom_uri, omega=3.141592*2/330.0, ppw=50)
        x = j.wait().return_value
        print('')
        print('=========================================================')
        for k, v in x.items():
            print(f'{k}: {v}')
        print('=========================================================')
        print('')

def main():
    run_example4()

if __name__ == '__main__':
    main()
