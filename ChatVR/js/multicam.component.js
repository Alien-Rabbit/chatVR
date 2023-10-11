AFRAME.registerComponent('multicam', {
    schema: {
      id: {default: 1},
    },
    init: function() {
        this.angle = 0;
        this.center = this.el.getAttribute('position');
        const el = this.el;
        const data = this.data;
        const id = data.id;
        // add multicam WIP
        const newMulticam = document.createElement('a-entity');
        newMulticam.setAttribute('id', 'camera'+id)
        newMulticam.setAttribute('secondary-camera', 'outputElement:#viewport'+id)
        const pos = el.getAttribute('position')
        newMulticam.object3D.position.set(pos);
        el.appendChild(newMulticam);
    },
    tick: function() {
      
    },
    remove: function(){
     this.el.destroy();
    }
  });