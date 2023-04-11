class RootModel extends Croquet.Model {

    init() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        this.hologramChildren = [];

        this.subscribe("hologram", "created", this.addHologram);
        this.subscribe("colorButton", "clicked", this.colorButtonClicked);
        console.log("MODEL initialized");
    }

    colorButtonClicked(data){
        console.log("MODEL received: color button clicked " + data.name);
        const color = this.#computeColor(data.name);
        this.hologramChildren.forEach(hologram => hologram.material.diffuseColor = color);
    }

    addHologram(data){
         console.log("MODEL received: hologram created " + data.name);
         console.log(this.scene.meshes.map(m => m.name));
         console.log(this.hologramChildren);
         const hologram = this.scene.meshes.find(m => m.name === data.name);
         if (!(typeof hologram === "undefined")) {
             this.hologramChildren.push(hologram);
         }
    }

    #computeColor(colorName){
        switch (colorName) {
            case "Blue":
                return BABYLON.Color3.Blue();
                break;
            case "Red":
                return BABYLON.Color3.Red();
                break;
            case "Green":
                return BABYLON.Color3.Green();
                break;
            case "Purple":
                return BABYLON.Color3.Purple();
                break;
            case "Yellow":
                return BABYLON.Color3.Yellow();
                break;
            case "Teal":
                return BABYLON.Color3.Teal();
                break;
            default:
                return BABYLON.Color3.White();
        }
    }

}


RootModel.register("RootModel");


export { RootModel };