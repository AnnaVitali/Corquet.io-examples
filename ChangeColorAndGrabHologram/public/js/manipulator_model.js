const canvas = document.getElementById("renderCanvas");
class ManipulatorModel extends Croquet.Model {

    init(options = {}) {
        this.hologram = options.hologram;
        this.hologramPosition = this.hologram.position;
        this.hologramRotation = this.hologram.rotation;
        this.scene = options.scene;
        this.controlTaken = false;

        this.subscribe("hologram", "positionChanged", this.updateHologramPosition);
        this.subscribe("view", "takeControl", this.notifyControlRequired);
        this.subscribe("view", "controlReleased", this.notifyControlReleased);
    }


    changeHologramColor(color){
        this.hologram.material.diffuseColor = color
    }

    notifyControlReleased(data){
        console.log("MODEL received: view control released")
        this.controlTaken = false;
        this.publish("view", "resetControl", data);
    }

    notifyControlRequired(data){
        console.log("MODEL received: view require control")
        this.controlTaken = true;
        this.publish("view", "manageControl", data);
    }

    updateHologramPosition(data){
        this.hologramPosition = new BABYLON.Vector3(data.position_x, data.position_y, data.position_z);
        this.hologramRotation = new BABYLON.Quaternion(data.rotation_x, data.rotation_y, data.rotation_z, data.rotation_w);
        this.publish("hologram", "updatePosition", data);
    }

}


ManipulatorModel.register("ManipulatorModel");


export { ManipulatorModel };