#!/usr/bin/env python3

from typing import cast

import field_slicer as fs
import hither2 as hi
import kachery_p2p as kp
import numpy as np
from surfaceview2._devel.example5_hither import example5_hither
import surfaceview2

def run_example5():
    import kachery_p2p as kp
    geom_uris = [
        'sha1://e7a0d631fb55727732e8f1b55c7dd05243eec56d/lens_r00.go3',
        'sha1://f20ff913ebfb3218305a26880d2452b17ab27e7c/con_r00.go3'
    ]
    mesh_uris = [
        'sha1://8bee86475f0c0fde0e73b60701b84c2c5384e2a7/lens_r00.msh',
        'sha1://b0c93605c6dee714368ac888ac28d67be575c015/con_r00.msh'
    ]
    job_cache = hi.JobCache(feed_name='job-cache')
    with hi.Config(use_container=True, show_console=True, job_cache=job_cache):
        j: hi.Job = example5_hither.run(geom_uris=geom_uris, mesh_uris=mesh_uris)
        x = j.wait().return_value
        vertices = x['vertices']
        faces = x['faces']
        ifaces = x['ifaces']
        M = surfaceview2.Model('miniwasp_example5')
        M.add_surface('miniwasp_example5', surfaceview2.Surface.from_numpy(vertices=vertices, faces=faces, ifaces=ifaces))
        obj = M.serialize()
        model_uri = kp.store_json(obj, basename='miniwasp_example5.json')
        print(f'Model URI: {model_uri}')
        # {
        #     'verts': verts,
        #     'iver_el_list': iver_el_list,
        #     'iverstart': iverstart,
        #     'iverind': iverind
        # }

def main():
    run_example5()

if __name__ == '__main__':
    main()
