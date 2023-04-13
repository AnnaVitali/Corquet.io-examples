const canvas = document.getElementById("renderCanvas");
class ManipulatorModel extends Croquet.Model {

    init(options = {}) {
        this.hologram = options.hologram;
        this.scene = options.scene;
        this.subscribe("hologram", "positionChanged", this.updateHologramPosition);
        this.subscribe("view", "takeControl", this.notifyControlRequired);
        this.subscribe("view", "controlReleased", this.notifyControlReleased);

    }

    changeHologramColor(color){
        this.hologram.material.diffuseColor = color
    }

    notifyControlReleased(data){
        console.log("MODEL received: view control released")
        this.publish("view", "resetControl", data);
    }

    notifyControlRequired(data){
        console.log("MODEL received: view require control")
        this.publish("view", "manageControl", data);
    }

    updateHologramPosition(data){
        this.publish("hologram", "updatePosition", data);
    }

}


ManipulatorModel.register("ManipulatorModel");


export { ManipulatorModel };