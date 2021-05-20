import hither2 as hi
from ..backend import taskfunction
from ..config import job_cache, job_handler
from ..workspace_list import WorkspaceList

@hi.function('workspace_list_subfeed', '0.1.0')
def workspace_list_subfeed(backend_uri):
    W = WorkspaceList(backend_uri=backend_uri)
    return W.get_subfeed_uri()

@taskfunction('workspace_list_subfeed.2')
def task_workspace_list_subfeed(backend_uri: str, cachebust: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=None):
        return hi.Job(workspace_list_subfeed, {'backend_uri': backend_uri})