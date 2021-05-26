import numpy as np
import hither2 as hi
import kachery_p2p as kp
import surfaceview2
from ..backend import taskfunction
from surfaceview2.config import job_cache, job_handler
from surfaceview2.workspace_list import WorkspaceList

@hi.function('get_vector_field_3d_slice_data', '0.1.3')
def get_vector_field_3d_slice_data(vector_field_3d_uri: str, plane: str, slice_index: int):
    V = surfaceview2.VectorField3D(vector_field_3d_uri)
    if plane == 'XY':
        a = V.values[:, :, :, slice_index]
    elif plane == 'XZ':
        a = V.values[:, :, slice_index, :]
    elif plane == 'YZ':
        a = V.values[:, slice_index, :, :]
    else:
        raise Exception('Unexpected plane')
    return {'values': np.stack((a.real.astype(np.float32), a.imag.astype(np.float32)))}

@taskfunction('get_vector_field_3d_slice_data.3')
def task_get_vector_field_3d_slice_data(vector_field_3d_uri: str, plane: str, slice_index: int):
    with hi.Config(job_handler=job_handler.misc, job_cache=None):
        return hi.Job(get_vector_field_3d_slice_data, {'vector_field_3d_uri': vector_field_3d_uri, 'plane': plane, 'slice_index': slice_index})