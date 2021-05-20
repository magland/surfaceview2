from typing import Union, cast

import kachery_p2p as kp
import numpy as np
from kachery_p2p.main import store_pkl
from surfaceview2.surface.vtk_to_mesh_dict import vtk_to_mesh_dict


class Surface:
    def __init__(self, arg: Union[dict, str]):
        if isinstance(arg, str):
            x = kp.load_json(arg)
            if not x:
                raise Exception(f'Unable to load: {arg}')
            arg = cast(dict, x)
        self._load(arg)
        self._arg = arg
    def serialize(self):
        return self._arg
    @property
    def vertices(self) -> np.ndarray: # n x 3
        return self._vertices
    @property
    def num_vertices(self):
        return self.vertices.shape[1]
    @property
    def num_faces(self):
        return len(self.ifaces)
    @property
    def faces(self) -> np.ndarray:
        return self._faces
    @property
    def ifaces(self) -> np.ndarray:
        return self._ifaces
    def _load(self, arg: dict):
        format = arg.get('surface_format')
        data = arg.get('data', {})
        if format == 'pkl_v1':
            pkl_uri = data['pkl_uri']
            x = kp.load_pkl(pkl_uri)
            if x is None:
                raise Exception(f'Unable to load: {pkl_uri}')
            self._vertices = x['vertices']
            self._faces = x['faces']
            self._ifaces = x['ifaces']
        else:
            raise Exception(f'Unexpected surface format: {format}')
    @staticmethod
    def from_numpy(*, vertices: np.ndarray, faces: np.ndarray, ifaces: np.ndarray):
        # vertices: n x 3
        # faces: m
        # ifaces: k
        assert vertices.shape[1] == 3
        return Surface({
            'surface_format': 'pkl_v1',
            'data': {
                'num_vertices': vertices.shape[0],
                'num_faces': len(ifaces),
                'pkl_uri': kp.store_pkl({
                    'vertices': vertices.astype(np.float32),
                    'faces': faces.astype(np.int32),
                    'ifaces': ifaces.astype(np.int32)
                })
            }
        })
    @staticmethod
    def from_vtk_unstructured_grid(vtk_uri: str):
        vtk_path = kp.load_file(vtk_uri)
        if vtk_path is None: raise Exception(f'Unable to load file: {vtk_uri}')
        x = vtk_to_mesh_dict(vtk_path, format='UnstructuredGrid', base64=False)
        vertices = np.array(x['vertices'], dtype=np.float32)
        faces = np.array(x['faces'], dtype=np.int32)
        ifaces = np.array(x['ifaces'], dtype=np.int32)
        return Surface.from_numpy(vertices=vertices, faces=faces, ifaces=ifaces)