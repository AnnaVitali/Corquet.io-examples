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

        this.#addElementToScene();

        this.subscribe("view", "readyToRender", this.activateRenderLoop);

    }

    addHologramChild() {
        this.hologramChildren.push(HologramModel.create({ position: new BABYLON.Vector3(0, 1.3, 1) }));
    }

    activateRenderLoop() {
        this.#createWebXRExperience().then(sceneToRender => {
            engine.runRenderLoop(() => sceneToRender.render());
        });
    }

    #addElementToScene() {
        this.addHologramChild();

        this.GUIManager = new BABYLON.GUI.GUI3DManager(scene);
        this.GUIManager.useRealisticScaling = true;

        this.#setupNearMenu();
    }

    
    #setupNearMenu() {
 
        console.log("MODEL publish: nearMenu created");
        this.publish("nearMenu", "created");

        this.nearMenuModel = NearMenuModel.create({
            holograms: this.hologramChildren,
            rows: 3,
            GUIManager: this.GUIManager,
            isPinned: true,
            //position: new BABYLON.Vector3(0, 0, -1)
            position: new BABYLON.Vector3(-0.2, 1.3, 1)
        });
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

}


class NearMenuModel extends Croquet.Model {
    init(options = {}) {
        this.holograms = options.holograms;
        this.nearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        this.buttons = []
        options.GUIManager.addControl(this.nearMenu);
        this.nearMenu.rows = options.rows;
        this.nearMenu.isPinned = options.isPinned;
        this.nearMenu.position = options.position;

        console.log()

        this.subscribe("view", "addColorButtons", this.addColorButton);
        this.publish("random", "test");

    }

    addColorButton(buttons) {
        buttons.buttonParams.forEach((properties) => {
            const button = new BABYLON.GUI.TouchHolographicButton();
            const color = this.#computeBabylonColor(properties.color);

            button.text = properties.name;
            button.onPointerDownObservable.add(() => {
                this.holograms.forEach((hologramModel) => {
                    hologramModel.changeMaterialColor(color);
                });
            });

            this.buttons.push(button);
            this.nearMenu.addButton(button);
        });
    }

    publishEventButtonClicked(colorName) {
        this.publish("button" + colorName, "clicked", colorName);
    }

    #computeBabylonColor(colorName) {
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


class HologramModel extends Croquet.Model {
    init(options = {}) {
        this.hologram = this.#createNewHologram(options.position);
    }

    changeMaterialColor(color) {
        this.hologram.material.diffuseColor = color;
    }

    #createNewHologram(position, scene) {
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.2, segments: 32 }, scene);
        sphere.position = position;

        const material = new BABYLON.StandardMaterial("material", scene);
        material.diffuseColor = BABYLON.Color3.Random();

        sphere.material = material;
  
        return sphere;
    }
}

RootModel.register("RootModel");
HologramModel.register("HologramModel");
NearMenuModel.register("NearMenuModel");


export { RootModel};