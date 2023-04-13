
class ManipulatorView extends Croquet.View {

    constructor(model, hologram, GUIManager) {
        super(model);
        this.model = model;
        this.hologram = hologram;
        this.GUIManager = GUIManager;
        this.nearMenuIsPresent = false;

        this.subscribe("view", "manageControl", this.manageHologramControl);
        this.subscribe("view", "resetControl", this.manageHologramControlReleased);
        this.subscribe("hologram", "updatePosition", this.updateHologramPosition);

        this.setupSession()
    }

    setupSession(){
        if(this.model.controlTaken){
            this.#changePositionAndRotation(this.model.hologramPosition, this.model.hologramRotation);
        }else{
            this.#addManipulateHologramNearMenu();
        }
    }

    updateHologramPosition(data){
        if(data.view !== this.id) {
            console.log("VIEW "+ this.id + " received: hologram position changed " + data.position_x + " " + data.position_y + " " + data.position_z + " ");
            const position = new BABYLON.Vector3(data.position_x, data.position_y, data.position_z);
            const rotation = new BABYLON.Quaternion(data.rotation_x, data.rotation_y, data.rotation_z, data.rotation_w);

           this.#changePositionAndRotation(position, rotation);
        }
    }

    manageHologramControlReleased(data){
        console.log("VIEW "+ this.id + " received: reset control");
        if(data.id === this.id){
            this.hologram.setParent(null);
            this.boundingBox.dispose();
            this.gizmo.attachedMesh = null;
            this.gizmo.dispose();
            this.#setupDefaultControlButtonBehavior();
        }else if(!this.nearMenuIsPresent){
            this.#addManipulateHologramNearMenu();
        }
    }

    manageHologramControl(data){
        console.log("VIEW "+ this.id + " received: manage hologram control");
        if(data.id !== this.id){
            this.manipulatorNearMenu.dispose();
            this.nearMenuIsPresent = false;
        }else{
            this.#addHologramManipulator();
        }
    }

    notifyHologramPositionChanged(hologramName, hologramPosition, hologramRotation){
        console.log("VIEW "+ this.id + " publish:  hologram position changed");
        this.publish("hologram", "positionChanged",
            {
                view: this.id,
                name: hologramName,
                position_x: hologramPosition.x,
                position_y: hologramPosition.y,
                position_z: hologramPosition.z,
                rotation_x: hologramRotation.x,
                rotation_y: hologramRotation.y,
                rotation_z: hologramRotation.z,
                rotation_w: hologramRotation.w
            });
    }

    notifyCurrentUserInControl(){
        console.log("VIEW "+ this.id + " publish: view take control");
        this.publish("view", "takeControl", {id: this.id});
    }

    notifyCurrentUserReleaseControl(){
        console.log("VIEW "+ this.id + " publish: view control released");
        this.publish("view", "controlReleased", {id: this.id});
    }

    #changePositionAndRotation(position, rotation){
        this.hologram.position = position;
        this.hologram.rotation = rotation;
    }

    #addHologramManipulator(){
        //create bounding box and object controls
        this.boundingBox = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(this.hologram);
        const utilLayer = new BABYLON.UtilityLayerRenderer(this.model.scene);
        utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
        this.gizmo = new BABYLON.BoundingBoxGizmo(BABYLON.Color3.FromHexString("#0984e3"), utilLayer)
        this.gizmo.rotationSphereSize = 0.03;
        this.gizmo.scaleBoxSize = 0.03;
        this.gizmo.attachedMesh = this.boundingBox;

        // Create behaviors to drag and scale with pointers in VR
        const sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
        sixDofDragBehavior.dragDeltaRatio = 1;
        sixDofDragBehavior.zDragFactor = 1;

        sixDofDragBehavior.onPositionChangedObservable.add(() => {
            this.notifyHologramPositionChanged(this.hologram.name, this.hologram.absolutePosition, this.hologram.absoluteRotationQuaternion);
        });
        this.boundingBox.addBehavior(sixDofDragBehavior);

        var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior();
        this.boundingBox.addBehavior(multiPointerScaleBehavior);

        this.controlButton.text = "Stop manipulating";
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            this.notifyCurrentUserReleaseControl();
        });
    }

    #addManipulateHologramNearMenu(){
        this.GUIManager.useRealisticScaling = true;

        this.manipulatorNearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        this.manipulatorNearMenu.rows = 1;
        this.GUIManager.addControl( this.manipulatorNearMenu);
        this.manipulatorNearMenu.isPinned = true;
        this.manipulatorNearMenu.position = new BABYLON.Vector3(+0.2, 1.3, 1);

        this.controlButton = new BABYLON.GUI.TouchHolographicButton();
        this.#setupDefaultControlButtonBehavior()
        this.manipulatorNearMenu.addButton(this.controlButton);

        this.nearMenuIsPresent = true;
        this.publish("view", "nearMenuAdded");

    }

    #setupDefaultControlButtonBehavior() {
        this.controlButton.text = "Start manipulating";
        this.controlButton.imageUrl = "../img/iconAdjust.png"
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            this.notifyCurrentUserInControl();
        });
    }

}

export { ManipulatorView };