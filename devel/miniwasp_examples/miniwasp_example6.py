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
        xgrid = x['xgrid']
        ygrid = x['ygrid']
        zgrid = x['zgrid']
        H = x['H']
        E = x['E']
        H0 = surfaceview2.VectorField3D.from_numpy(xgrid=xgrid, ygrid=ygrid, zgrid=zgrid, values=H)
        E0 = surfaceview2.VectorField3D.from_numpy(xgrid=xgrid, ygrid=ygrid, zgrid=zgrid, values=E)

        M = surfaceview2.Model('miniwasp_example6')
        M.add_vector_field_3d('H', H0)
        M.add_vector_field_3d('E', E0)
        model_uri = kp.store_json(M.serialize(), basename='miniwasp_example5.json')
        print(f'Model URI: {model_uri}')

def main():
    run_example6()

if __name__ == '__main__':
    main()
