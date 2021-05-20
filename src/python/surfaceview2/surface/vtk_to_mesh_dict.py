def vtk_to_mesh_dict(vtk_path: str, format: str, base64: bool=False) -> dict:
    import numpy as np
    from vtk.util.numpy_support import vtk_to_numpy
    from vtk import vtkUnstructuredGridReader, vtkXMLPolyDataReader
    from vtk.numpy_interface import dataset_adapter as dsa
    from surfaceview2.backend._serialize import _serialize

    if format == 'UnstructuredGrid':
        reader = vtkUnstructuredGridReader()
    elif format == 'XMLPolyData':
        reader = vtkXMLPolyDataReader()
    else:
        raise Exception(f'Unexpected format: {format}')
    reader.SetFileName(vtk_path)
    reader.Update()
    X = reader.GetOutput()
    Y = dsa.WrapDataObject(X)

    vertices0 = vtk_to_numpy(Y.Points) # 3 x n
    vertices = vertices0.T.tolist()
    if format == 'XMLPolyData':
        faces0 = vtk_to_numpy(Y.Polygons)
    else:
        faces0 = vtk_to_numpy(Y.Cells)
    ifaces = []
    faces = []
    i = 0
    while i < len(faces0):
        num_points = faces0[i]
        i = i + 1
        ifaces.append(len(faces))
        for j in range(num_points):
            faces.append(int(faces0[i]))
            i = i + 1

    if base64:
        vertices = _serialize(np.array(vertices, dtype=np.float32))
        ifaces = _serialize(np.array(ifaces, dtype=np.int32))
        faces = _serialize(np.array(faces, dtype=np.int32))

    return {
        'vertices': vertices,
        'ifaces': ifaces,
        'faces': faces
    }
