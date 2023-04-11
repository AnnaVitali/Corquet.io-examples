const canvas = document.getElementById("renderCanvas");
class RootModel extends Croquet.Model {

    init() {
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.doesHologramChangedColor = false;

        this.hologramChildren = [];

        this.subscribe("hologram", "created", this.addHologram);
        this.subscribe("colorButton", "clicked", this.colorButtonClicked);
        this.subscribe("hologram", "positionChanged", this.updateHologramPosition);
        this.subscribe("view", "takeControl", this.notifyControlRequired);
        console.log("MODEL initialized");
    }

    notifyControlRequired(data){
        this.publish("view", "manageControl", data);
    }

    updateHologramPosition(data){
        console.log("MODEL received: hologram position changed " + data.position_x + " " + data.position_y + " " + data.position_z + " ");
        const hologram = this.scene.meshes.find(m => m.name === data.name);
        if (!(typeof hologram === "undefined")) {
            const position =  new BABYLON.Vector3(data.position_x, data.position_y, data.position_z);
            const rotation =  new BABYLON.Vector3(data.rotation_x, data.rotation_y, data.rotation_z);
            if(hologram.absolutePosition !== position) {
                hologram.position = new BABYLON.Vector3(data.position_x, data.position_y, data.position_z);
            }else if (hologram.rotation !== rotation) {
                hologram.rotation = new BABYLON.Vector3(data.rotation_x, data.rotation_y, data.rotation_z, data.rotation_w);
            }
        }
    }

    colorButtonClicked(data){
        console.log("MODEL received: color button clicked " + data.name);
        if(this.doesHologramChangedColor === false){
            this.doesHologramChangedColor === true;
        }
        const color = this.#computeColor(data.name);
        this.hologramChildren.forEach(hologram => hologram.material.diffuseColor = color);
    }

    addHologram(data){
         console.log("MODEL received: hologram created " + data.name);
         console.log(this.scene.meshes.map(m => m.name));
         console.log(this.hologramChildren);
         const hologram = this.scene.meshes.find(m => m.name === data.name);
         if (!(typeof hologram === "undefined") && !this.hologramChildren.map(h => h.name).includes(data.name)) {
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