import kachery_p2p as kp
from typing import Dict, List, Union, cast
from ..surface import Surface


class Model:
    def __init__(self, label: str):
        self._surfaces: Dict[str, Surface] = {}
        self._label = label
    def add_surface(self, name: str, x: Surface):
        self._surfaces[name] = x
    def serialize(self):
        ret = {'surfaces': {}}
        for k, v in self._surfaces.items():
            ret['surfaces'][k] = self._surfaces[k].serialize()
        return ret
    @property
    def label(self):
        return self._label
    @property
    def surface_names(self):
        return sorted(list(self._surfaces.keys()))
    def get_surface(self, name: str):
        return self._surfaces[name]
    @staticmethod
    def deserialize(x: Union[dict, str], *, label: str):
        if isinstance(x, str):
            obj = kp.load_json(x)
            assert x is not None, f'Unable to load {x}'
            x = cast(dict, obj)
        M = Model(label=label)
        for k, v in x.get('surfaces', {}).items():
            M.add_surface(k, Surface(v))
        return M