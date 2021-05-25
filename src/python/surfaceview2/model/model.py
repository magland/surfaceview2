import kachery_p2p as kp
from typing import Dict, List, Union, cast
from ..surface import Surface
from ..vectorfield3d import VectorField3D


class Model:
    def __init__(self, label: str):
        self._surfaces: Dict[str, Surface] = {}
        self._vectorfield3ds: Dict[str, VectorField3D] = {}
        self._label = label
    def add_surface(self, name: str, x: Surface):
        self._surfaces[name] = x
    def add_vector_field_3d(self, name: str, x: VectorField3D):
        self._vectorfield3ds[name] = x
    def serialize(self):
        ret = {'surfaces': {}, 'vectorfield3ds': {}}
        for k, v in self._surfaces.items():
            ret['surfaces'][k] = self._surfaces[k].serialize()
        for k, v in self._vectorfield3ds.items():
            ret['vectorfield3ds'][k] = self._vectorfield3ds[k].serialize()
        return ret
    @property
    def label(self):
        return self._label
    @property
    def surface_names(self):
        return sorted(list(self._surfaces.keys()))
    def get_surface(self, name: str):
        return self._surfaces[name]
    @property
    def vector_field_3d_names(self):
        return sorted(list(self._vectorfield3ds.keys()))
    def get_vector_field_3d(self, name: str):
        return self._vectorfield3ds[name]
    @staticmethod
    def deserialize(x: Union[dict, str], *, label: str):
        if isinstance(x, str):
            obj = kp.load_json(x)
            assert x is not None, f'Unable to load {x}'
            x = cast(dict, obj)
        M = Model(label=label)
        for k, v in x.get('surfaces', {}).items():
            M.add_surface(k, Surface(v))
        for k, v in x.get('vectorfield3ds', {}).items():
            M.add_vector_field_3d(k, VectorField3D(v))
        return M