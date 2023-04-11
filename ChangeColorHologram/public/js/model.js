class RootModel extends Croquet.Model {

    init() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        this.hologramChildren = [];

        this.subscribe("hologram", "created", this.addHologram);
        console.log("MODEL initialized");
    }

    addHologram(data){
        console.log("MODEL received: hologram created " + data);
        this.hologramChildren.push(this.scene.meshes.find(m => m.name === data.name));
    }

}


RootModel.register("RootModel");


export { RootModel };