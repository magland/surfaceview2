from typing import Union, cast

import kachery_p2p as kp
import numpy as np

class VectorField3D:
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
    def xgrid(self) -> np.ndarray:
        return self._xgrid
    @property
    def ygrid(self) -> np.ndarray:
        return self._ygrid
    @property
    def zgrid(self) -> np.ndarray:
        return self._zgrid
    @property
    def dim(self) -> int:
        return self._values.shape[0]
    @property
    def values(self) -> np.ndarray:
        return self._values
    def _load(self, arg: dict):
        format = arg.get('vectorfield3d_format')
        data = arg.get('data', {})
        if format == 'pkl_v1':
            pkl_uri = data['pkl_uri']
            x = kp.load_pkl(pkl_uri)
            if x is None:
                raise Exception(f'Unable to load: {pkl_uri}')
            self._xgrid = x['xgrid']
            self._ygrid = x['ygrid']
            self._zgrid = x['zgrid']
            self._values = x['values']
        else:
            raise Exception(f'Unexpected vector3d format: {format}')
    @staticmethod
    def from_numpy(*, xgrid: np.ndarray, ygrid: np.ndarray, zgrid: np.ndarray, values: np.ndarray):
        assert values.ndim == 4
        assert values.shape[1] == len(xgrid)
        assert values.shape[2] == len(ygrid)
        assert values.shape[3] == len(zgrid)
        return VectorField3D({
            'vectorfield3d_format': 'pkl_v1',
            'data': {
                'pkl_uri': kp.store_pkl({
                    'xgrid': xgrid,
                    'ygrid': ygrid,
                    'zgrid': zgrid,
                    'values': values
                })
            }
        })