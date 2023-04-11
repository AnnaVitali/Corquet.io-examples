
class RootView extends Croquet.View {

    constructor(model) {
        super(model);
        this.model = model;

        this.subscribe("view", "manageControl", this.manageHologramControl);
        this.subscribe("view", "resetControl", this.manageHologramControlReleased);
        console.log("VIEW " + this.id);

        this.#initializeScene();
        this.#activateRenderLoop();
    }

    manageHologramControlReleased(data){
        console.log("VIEW received: reset control");
        if(data.id !== this.id){
            this.#addManipulateHologramNearMenu();
        }else{
            this.gizmo.attachedMesh = null;
            this.#setupDefaultControlButtonBehavior();
        }
    }

    manageHologramControl(data){
        console.log("VIEW received: user in control");
        if(data.id !== this.id){
            this.manipulatorNearMenu.dispose();
        }else{
            this.#addHologramManipulator();
        }
    }

    notifyButtonClicked(name){
        console.log("VIEW publish: colorButton clicked " + name);
        this.publish("colorButton", "clicked", {name: name});
    }

    notifyHologramPositionChanged(hologramName, hologramPosition, hologramRotation){
        console.log("VIEW publish: hologram position changed");
        this.publish("hologram", "positionChanged",
            {
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
        console.log("VIEW publish: view take control");
        this.publish("view", "takeControl", {id: this.id});
    }

    notifyCurrentUserReleaseControl(){
        console.log("VIEW publish: view control released");
        this.publish("view", "controlReleased", {id: this.id});
    }

    #addHolographicElement() {
        this.hologramName = "sphere"
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.2, segments: 32}, this.model.scene);
        sphere.position =  new BABYLON.Vector3(0, 1.3, 1);
        sphere.computeWorldMatrix(true);

        const material = new BABYLON.StandardMaterial("material", this.model.scene);
        material.diffuseColor = BABYLON.Color3.White();

        sphere.material = material;

        console.log("VIEW: publish hologram created" + this.hologramName);
        this.publish("hologram", "created", {name: this.hologramName});
    }

    #initializeScene(){
        this.model.scene.clearColor = new BABYLON.Color3.Black;

        const alpha = -Math.PI / 2;//Math.PI/4;
        const beta = Math.PI / 2;
        const radius = 0;
        const target = new BABYLON.Vector3(0, 0, 0);

        const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, this.model.scene);//camera that can be rotated around a target
        camera.attachControl(this.model.canvas, true);

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
        light.intensity = 1;

        this.GUIManager = new BABYLON.GUI.GUI3DManager(this.model.scene);

        this.#addHolographicElement();
        this.#addChangeColorNearMenu();
        this.#addManipulateHologramNearMenu();
    }

    #addHologramManipulator(){
        //create bounding box and object controls
        const hologram = this.model.hologramChildren.find(h => h.name === this.hologramName);
        const boundingBox = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(hologram);
        const utilLayer = new BABYLON.UtilityLayerRenderer(this.model.scene);
        utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
        this.gizmo = new BABYLON.BoundingBoxGizmo(BABYLON.Color3.FromHexString("#0984e3"), utilLayer)
        this.gizmo.rotationSphereSize = 0.03;
        this.gizmo.scaleBoxSize = 0.03;
        this.gizmo.attachedMesh = boundingBox;

        // Create behaviors to drag and scale with pointers in VR
        const sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
        sixDofDragBehavior.dragDeltaRatio = 1;
        sixDofDragBehavior.zDragFactor = 1;

        sixDofDragBehavior.onPositionChangedObservable.add(() => {
            this.notifyHologramPositionChanged(hologram.name, hologram.absolutePosition, hologram.absoluteRotationQuaternion);
        });
        boundingBox.addBehavior(sixDofDragBehavior);

        var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior();
        boundingBox.addBehavior(multiPointerScaleBehavior);

        this.controlButton.text = "Stop manipulating";
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            this.notifyCurrentUserReleaseControl();
        });
    }

    #addChangeColorNearMenu(){
        this.GUIManager.useRealisticScaling = true;

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
        this.GUIManager.addControl(nearMenu);
        nearMenu.isPinned = true;
        nearMenu.position = new BABYLON.Vector3(-0.2, 1.3, 1);

        buttonParams.forEach(input => {
            const button = new BABYLON.GUI.TouchHolographicButton();
            button.text = input.name;
            button.onPointerDownObservable.add(() => {
                this.notifyButtonClicked(input.name);
            });

            nearMenu.addButton(button);
        })
    }

    #addManipulateHologramNearMenu(){
        this.GUIManager.useRealisticScaling = true;

        const buttonParams = [
            { name: "Start Manipulating", imageUrl: "../img/iconAdjust.png" }
        ]

        this.manipulatorNearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        this.manipulatorNearMenu.rows = 1;
        this.GUIManager.addControl( this.manipulatorNearMenu);
        this.manipulatorNearMenu.isPinned = true;
        this.manipulatorNearMenu.position = new BABYLON.Vector3(+0.2, 1.3, 1);

        this.controlButton = new BABYLON.GUI.TouchHolographicButton();
        this.#setupDefaultControlButtonBehavior()
        this.manipulatorNearMenu.addButton(this.controlButton);

    }

    #setupDefaultControlButtonBehavior() {
        this.controlButton.text = "Start manipulating";
        this.controlButton.imageUrl = "../img/iconAdjust.png"
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            this.notifyCurrentUserInControl();
        });
    }

    async #createWebXRExperience() {
        const supported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar')

        if (supported) {
            console.log("IMMERSIVE AR SUPPORTED");
            const xrHelper = await this.model.scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                    referenceSpaceType: "local-floor"
                }
            });
        } else {
            console.log("IMMERSIVE VR SUPPORTED")
            const xrHelper = await this.model.scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-vr',
                }
            });
        }

        try {
            xrHelper.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
        } catch (err) {
            console.log("Articulated hand tracking not supported in this browser.");
        }

        return this.model.scene;
    }

    #activateRenderLoop() {
        this.#createWebXRExperience().then(sceneToRender => {
            this.model.engine.runRenderLoop(() => sceneToRender.render());
        });
    }
}

export { RootView };