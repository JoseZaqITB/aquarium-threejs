# Controls
## PointerLockControl
by default it rotates the camera with the mouse and moves with keys in the xz axes.
so, you must add Y camera moves manually using 
```
camera.position.y += normalizedViewCameraDirection * velocity;
```

