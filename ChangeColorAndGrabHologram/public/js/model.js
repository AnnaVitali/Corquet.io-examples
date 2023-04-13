import { ManipulatorModel } from "./manipulator_model.js";

const canvas = document.getElementById("renderCanvas");
class RootModel extends Croquet.Model {

    init() {
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.doesHologramChangedColor = false;

        this.hologramChildren = [];

        this.subscribe("hologram", "created", this.addHologram);
        this.subscribe("colorButton", "clicked", this.colorButtonClicked);
        console.log("model created");
    }

    colorButtonClicked(data){
        console.log("MODEL received: color button clicked " + data.name);
        if(this.doesHologramChangedColor === false){
            this.doesHologramChangedColor === true;
        }

        this.hologramChildren.forEach(manipulator => manipulator.changeHologramColor(this.#computeColor(data.name)));
    }

    addHologram(data){
         const hologram = this.scene.meshes.find(m => m.name === data.name);
         if (!(typeof hologram === "undefined") && !this.hologramChildren.map(h => h.name).includes(data.name)) {
             this.hologramChildren.push( ManipulatorModel.create({hologram: hologram, scene: this.scene}));
         }
        this.publish("model", "hologramAdded");
    }

    #computeColor(colorName){
        switch (colorName) {
            case "Blue":
                return BABYLON.Color3.Blue();
            case "Red":
                return BABYLON.Color3.Red();
            case "Green":
                return BABYLON.Color3.Green();
            case "Purple":
                return BABYLON.Color3.Purple();
            case "Yellow":
                return BABYLON.Color3.Yellow();
            case "Teal":
                return BABYLON.Color3.Teal();
            default:
                return BABYLON.Color3.White();
        }
    }

}


RootModel.register("RootModel");


export { RootModel };