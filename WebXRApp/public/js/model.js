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
        this.#activateRenderLoop();

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


RootModel.register("RootModel");


export { RootModel };