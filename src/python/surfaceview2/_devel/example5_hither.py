import os
from typing import List
import hither2 as hi
import kachery_p2p as kp
import numpy as np

thisdir = os.path.dirname(os.path.realpath(__file__))
@hi.function(
    'example5_hither', '0.1.6',
    image=hi.DockerImageFromScript(name='magland/miniwasp', dockerfile=f'{thisdir}/docker-miniwasp/Dockerfile'),
    kachery_support=True
)
def example5_hither(geom_uris: List[str], mesh_uris: List[str]):
    import mwaspbie as mw
    import fmm3dbie as bie

    with kp.TemporaryDirectory() as tmpdir:
        geom_fnames: List[str] = []
        for i, geom_uri in enumerate(geom_uris):
            a = kp.load_file(geom_uri, dest=f'{tmpdir}/geom{i}.go3')
            assert a is not None
            geom_fnames.append(a)
        mesh_fnames: List[str] = []
        for i, mesh_uri in enumerate(mesh_uris):
            a = kp.load_file(mesh_uri, dest=f'{tmpdir}/mesh{i}.msh')
            assert a is not None
            mesh_fnames.append(a)
        n_components = len(geom_fnames)
        
        # surf_fname = f'{tmpdir}/surf.vtk'
        # surfx_fname = f'{tmpdir}/surfx.vtk'
        # surf_normals_fname = f'{tmpdir}/surf_normals.vtk'
        # surf_znormals_fname = f'{tmpdir}/surf_znormals.vtk'
        # jvals_fname = f'{tmpdir}/jvals.vtk'
        # jvals_ex_fname = f'{tmpdir}/jvals_ex.vtk'
        # kvals_fname = f'{tmpdir}/kvals.vtk'

        # compute number of patches and points
        npatches, npts = mw.em_solver_wrap_mem('?'.join(geom_fnames) + '?', n_components)

        # Set translation and scaling of each component
        dP = np.zeros((4,n_components),order="F")
        dP[3,:] = 1.0

        eps = 1e-6

        # Get geometry info
        [npatches_vect,npts_vect,norders,ixyzs,iptype,srcvals,srccoefs,wts,sorted_vector,exposed_surfaces] = mw.em_solver_open_geom('?'.join(geom_fnames) + '?', dP, npatches, npts,eps)

        #Estimate number of vertices and flat triangles in geometry
        nverts,nel = mw.em_gen_plot_info_surf_mem('?'.join(mesh_fnames) + '?', n_components)

        # Get the vertices and definition of the flat triangles in the geometry
        verts,elements = mw.em_gen_plot_info_surf('?'.join(mesh_fnames) + '?', n_components, nverts, nel)

        # Transpose the list of elements, i.e. elements currently
        # stores which vertices form the flat triangles, the transpose
        # stores which elements meet at a given vertex and are stored
        # in a sparse compressed format
        #
        # iver_el_list: stores a continuous list of element ids
        # iverstart: iverstart[i] indicates the location in the iver_el_list array
        #   where the list of elements for vertex i begin
        # iverind: denotes the vertex number in element iver_el_list[j] 
        #  corresponding to the vertex i of the vertex-element pair
        #  [i,iver_el_list[j]]

        iver_el_list,iverstart,iverind = mw.em_elem_trans(nverts,elements)

        fvals = srcvals[0:3,:]
        rscales = np.ones(nel)

        fvalsout = mw.em_surf_fun_to_plot_fun(norders,ixyzs,iptype,fvals,iver_el_list,iverstart,iverind,rscales)

        erra = np.linalg.norm(fvalsout-verts)/np.linalg.norm(verts)
        print("error in estimating vertex locations="+str(erra))

        faces = elements.T.ravel()
        ifaces = np.arange(1, len(faces) + 1, 3)
        return {
            'vertices': verts.T,
            'faces': faces - 1,
            'ifaces': ifaces - 1
        }
