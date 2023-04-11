
class RootView extends Croquet.View {

    constructor(model) {
        super(model);
        this.model = model;

        this.#initializeScene();
        this.#activateRenderLoop();
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
        this.#addNearMenu();
    }

    notifyButtonClicked(name){
        console.log("VIEW publish: colorButton clicked " + name);
        this.publish("colorButton", "clicked", {name: name});
    }

    #addHolographicElement() {
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.2, segments: 32}, this.model.scene);
        sphere.position =  new BABYLON.Vector3(0, 1.3, 1);

        const material = new BABYLON.StandardMaterial("material", this.model.scene);
        material.diffuseColor = BABYLON.Color3.White();

        sphere.material = material;
        console.log("VIEW: publish hologram created" + sphere.name);
        this.publish("hologram", "created", {name: sphere.name});
    }

    #addNearMenu(){
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