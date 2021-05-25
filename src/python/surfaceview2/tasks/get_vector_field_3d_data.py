import numpy as np
import hither2 as hi
import kachery_p2p as kp
import surfaceview2
from ..backend import taskfunction
from surfaceview2.config import job_cache, job_handler
from surfaceview2.workspace_list import WorkspaceList

@hi.function('get_vector_field_3d_data', '0.1.3')
def get_vector_field_3d_data(vector_field_3d_uri: str):
    V = surfaceview2.VectorField3D(vector_field_3d_uri)
    return dict({
        'xgrid': V.xgrid.astype(np.float32),
        'ygrid': V.ygrid.astype(np.float32),
        'zgrid': V.zgrid.astype(np.float32),
        'values': np.stack((V.values.real.astype(np.float32), V.values.imag.astype(np.float32)))
    })

@taskfunction('get_vector_field_3d_data.3')
def task_get_vector_field_3d_data(vector_field_3d_uri: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=None):
        return hi.Job(get_vector_field_3d_data, {'vector_field_3d_uri': vector_field_3d_uri})