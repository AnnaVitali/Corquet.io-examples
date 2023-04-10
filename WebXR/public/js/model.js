const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

class RootModel extends Croquet.Model {

    init() {
       
        scene.clearColor = new BABYLON.Color3.Black;

        const alpha = -Math.PI / 2;//Math.PI/4;
        const beta = Math.PI / 2;
        const radius = 2;
        const target = new BABYLON.Vector3(0, 0, 0);

        const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, scene);//camera that can be rotated around a target
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
        light.intensity = 1;

        this.hologramChildren = [];
        this.addHologramChild(HologramModel.create({ position: new BABYLON.Vector3(0, 1.3, 1) }));

        this.GUIManager = new BABYLON.GUI.GUI3DManager(scene);

        this.#activateRenderLoop();

    }

    addHologramChild(hologramChild) {
        this.hologramChildren.push(hologramChild);
    }

    /*
    #setupNearMenu() {
        const buttonParams = [
            { name: "Blue", color: BABYLON.Color3.Blue() },
            { name: "Red", color: BABYLON.Color3.Red() },
            { name: "Green", color: BABYLON.Color3.Green() },
            { name: "Purple", color: BABYLON.Color3.Purple() },
            { name: "Yellow", color: BABYLON.Color3.Yellow() },
            { name: "Teal", color: BABYLON.Color3.Teal() },
        ]

        this.nearMenuModel = NearMenuModel.create({
            rows: 3,
            GUIManager: this.GUIManager,
            isPinned: true,
            position: new BABYLON.Vector3(-0.2, 1.3, 1),
            buttonParams: buttonParams
        });
    }
    */
    #setupScene() {
        
    }

    async #createWebXRExperience() {
        const supported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar')

        if (supported) {
            console.log("IMMERSIVE AR SUPPORTED");
            const xrHelper = await scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                    referenceSpaceType: "local-floor"
                }
            });
        } else {
            console.log("IMMERSIVE VR SUPPORTED")
            const xrHelper = await scene.createDefaultXRExperienceAsync({
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

        return scene;
    }

    #activateRenderLoop() {
        this.#createWebXRExperience().then(sceneToRender => {
            engine.runRenderLoop(() => sceneToRender.render());
        });
    }

}

/*
class NearMenuModel extends Croquet.Model {
    init(options = {}) {
        this.nearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        this.nearMenu.rows = options.rows;
        this.nearMenu.isPinned = options.isPinned;
        this.nearMenu.position = options.position;

        options.GUIManager.addControl(nearMenu);

        this.#setupButtons(options.buttonParams);

        this.publish("nearMenu", "created");
    }

    #setupButtons(buttonParams) {
        buttonParams.forEach(button => {
            input = new BABYLON.GUI.TouchHolographicButton();
            input.text = button.name;
           /* input.onPointerDownObservable.add(() => //todo
                );
            });
            this.nearMenu.addButton(input);
        });
    }
}
*/

class HologramModel extends Croquet.Model {
    init(options = {}) {
        this.hologram = this.#createNewHologram(options.position);


    }

    #createNewHologram(position, scene) {
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.2, segments: 32 }, scene);
        sphere.position = position;

        const material = new BABYLON.StandardMaterial("material", scene);
        material.diffuseColor = BABYLON.Color3.Random();

        sphere.material = material;
        this.publish("hologram", "created");
        return sphere;
    }
}

RootModel.register("RootModel");
HologramModel.register("HologramModel");
//NearMenuModel.register("NearMenuModel");


export { RootModel, HologramModel };