A *model* in surfaceview2 comprises a collection of surfaces and a collection of 3D vector fields that live in the same 3D space.

To add a model to this workspace, run a Python script on the computer running the backend provider.

Here is an example script that requires that you have access to a .vtk file in unstructured grid format:

```python
import surfaceview2

# Define the new model
M = surfaceview2.Model('model1')
s = surfaceview2.Surface.from_vtk_unstructured_grid('sha1://c5860c1d68f08635baac933bfa63160138a9097a/surf.vtk')
M.add_surface('surface1', s)

# Load the workspace and add the model
W = surfaceview2.load_workspace('{workspaceUri}')
W.add_model(M)
```

Here is an example script that assumes you have a URI for the serialized model:

```python
import surfaceview2

# Load the model to be added
M = surfaceview2.Model.deserialize('sha1://..../model.json', label='model1')

# Load the workspace and add the model
W = surfaceview2.load_workspace('{workspaceUri}')
W.add_model(M)
```

In the context of the miniwasp project, you can generate a URI for a new model by running one of the [examples found here](https://github.com/magland/surfaceview2/tree/main/devel/miniwasp_examples). That will print a model URI to the console and you can use the above script to add the model to the workspace.