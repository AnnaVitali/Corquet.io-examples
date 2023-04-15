class RootView extends Croquet.View {

    constructor(model) {
        super(model);
        this.model = model;

       // this.subscribe("controlButton", "clicked", this.manageUserHologramControls);
        this.subscribe(this.viewId, "hideManipulatorMenu", this.hideManipulatorMenu);

        console.log("VIEW subscribed ");
        this.#addChangeColorMenu();
        this.#addManipulatorMenu();
    }

    hideManipulatorMenu(){
        console.log("VIEW: received hide manipulator menu");
        this.manipulatorNearMenu.dispose();
    }

    notifyColorButtonClicked(colorName){
        console.log("VIEW: color button clicked");
        this.publish("colorButton", "clicked", {color: colorName});
    }

    notifyUserStartManipulating(){
        console.log("VIEW: user start manipulating");
        this.publish("controlButton", "clicked", {view: this.viewId});
    }

    notifyHologramPositionChanged(position, rotation){
        console.log("VIEW: hologram position change");
        this.publish("hologram", "positionChanged",
            {
                position_x: position.x,
                position_y: position.y,
                position_z: position.z,
                rotation_x: rotation.x,
                rotation_y: rotation.y,
                rotation_z: rotation.z,
                rotation_w: rotation.w
            });
    }

    #addChangeColorMenu(){
        const buttonParams = [
            { name: "Blue", color: BABYLON.Color3.Blue() },
            { name: "Red", color: BABYLON.Color3.Red() },
            { name: "Green", color: BABYLON.Color3.Green() },
            { name: "Purple", color: BABYLON.Color3.Purple() },
            { name: "Yellow", color: BABYLON.Color3.Yellow() },
            { name: "Teal", color: BABYLON.Color3.Teal() },
        ]

        const nearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        nearMenu.rows = 3;
        this.model.GUIManager.addControl(nearMenu);
        nearMenu.isPinned = true;
        nearMenu.position = new BABYLON.Vector3(-0.2, 1.2, 0.5);

        buttonParams.forEach(input => {
            const button = new BABYLON.GUI.TouchHolographicButton();
            button.text = input.name;
            button.onPointerDownObservable.add(() => {
                this.notifyColorButtonClicked(input.name);
            });

            nearMenu.addButton(button);
        })
    }

    #addManipulatorMenu(){
        this.manipulatorNearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        this.manipulatorNearMenu.rows = 1;
        this.model.GUIManager.addControl( this.manipulatorNearMenu);
        this.manipulatorNearMenu.isPinned = true;
        this.manipulatorNearMenu.position = new BABYLON.Vector3(+0.2, 1.2, 0.5);

        this.controlButton = new BABYLON.GUI.TouchHolographicButton();
        this.#setDefaultControlButtonBehavior()
        this.manipulatorNearMenu.addButton(this.controlButton);
    }

    #setDefaultControlButtonBehavior() {
        this.controlButton.text = "Start manipulating";
        this.controlButton.imageUrl = "../img/iconAdjust.png"
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            this.#addHologramManipulator();
            this.notifyUserStartManipulating();
        });
    }

    #addHologramManipulator(){
        //create bounding box and object controls
        this.viewSphere = BABYLON.MeshBuilder.CreateSphere("viewSphere", {diameter: 0.2, segments: 32}, this.model.scene);
        this.viewSphere.position = new BABYLON.Vector3(this.model.sphere.absolutePosition.x, this.model.sphere.absolutePosition.y, this.model.sphere.absolutePosition.z);
        this.viewSphere.rotationQuaternion = new BABYLON.Quaternion(this.model.sphere.absoluteRotationQuaternion.x, this.model.sphere.absoluteRotationQuaternion.y, this.model.sphere.absoluteRotationQuaternion.z, this.model.sphere.absoluteRotationQuaternion.w);
        this.viewSphere.isVisible = false;

        this.boundingBox = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(this.viewSphere);
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
            this.notifyHologramPositionChanged(this.viewSphere.absolutePosition, gizmo.onScaleBoxDragObservable.add(() => {
                console.log("scaleDrag");
            });
            gizmo.onScaleBoxDragEndObservable.add(() => {
                console.log("scaleEnd");
            });
            gizmo.onRotationSphereDragObservable.add(() => {
                console.log("rotDrag");
            });
            gizmo.onRotationSphereDragEndObservable.add(() => {
                console.log("rotEnd");
            }););
        });
        this.boundingBox.addBehavior(sixDofDragBehavior);

        this.gizmo.onScaleBoxDragObservable.add(() => {
            console.log("scaleDrag");
        });
        this.gizmo.onScaleBoxDragEndObservable.add(() => {
            console.log("scaleEnd");
        });
        this.gizmo.onRotationSphereDragObservable.add(() => {
            console.log("rotDrag");
        });

        /*
        var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior();
        this.boundingBox.addBehavior(multiPointerScaleBehavior);
        */

        this.controlButton.text = "Stop manipulating";
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            //this.notifyCurrentUserReleaseControl();
        });
    }
}



export { RootView };