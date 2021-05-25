import hither2 as hi
import kachery_p2p as kp
import surfaceview2
from ..backend import taskfunction
from surfaceview2.config import job_cache, job_handler
from surfaceview2.workspace_list import WorkspaceList

@hi.function('get_model_info', '0.1.6')
def get_model_info(model_uri: str):
    model_object = kp.load_json(model_uri)
    if not model_object:
        raise Exception(f'Unable to load object: {model_object}')
    E = surfaceview2.Model.deserialize(model_object, label='')
    ret = {
        'surfaces': {},
        'vectorfield3ds': {}
    }
    for name in E.surface_names:
        s = E.get_surface(name)
        ret['surfaces'][name] = {
            'numVertices': s.num_vertices,
            'numFaces': s.num_faces,
            'uri': kp.store_json(s.serialize())
        }
    for name in E.vector_field_3d_names:
        v = E.get_vector_field_3d(name)
        ret['vectorfield3ds'][name] = {
            'uri': kp.store_json(v.serialize()),
            'nx': len(v.xgrid),
            'ny': len(v.ygrid),
            'nz': len(v.zgrid),
            'dim': v.values.shape[0]
        }
    return ret

@taskfunction('get_model_info.6')
def task_get_model_info(model_uri: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(get_model_info, {'model_uri': model_uri})