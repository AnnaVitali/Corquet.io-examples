class RootView extends Croquet.View {

    constructor(model) {
        super(model);
        this.model = model;

       this.attachHologramChild;
       this.attachNearMenu;

        this.publish("view", "readyToRender");
        console.log("VIEW publish: ready to render");
    }

    attachHologramChild() {
        console.log("VIEW received: hologram created")
        new HologramView(this.model.hologramChildren[this.model.hologramChildren.length - 1]);
    }

    
    attachNearMenu() {
        console.log("VIEW received: nearMenu created");
        new NearMenuView(this.model.nearMenuModel);
    }

   
}

class HologramView extends Croquet.View {

    constructor(model) {
        super(model);
    }
}


class NearMenuView extends Croquet.View {

    constructor(model) {
        super(model);
        this.#startPopulatingNearMenu();
        console.log("NEARMENUVIEW created");
    }

    #startPopulatingNearMenu() {

        const buttonParams = [
            {
                name: "Blue",
                color: "Blue"
            },
            {
                name: "Red",
                color: "Red"
            },
            {
                name: "Green",
                color: "Green"
            },
            {
                name: "Purple",
                color: "Purple"
            },
            {
                name: "Yellow",
                color: "Yellow"
            },
            {
                name: "Teal",
                color: "Teal"
            },
        ]

        this.publish("view", "addColorButtons", { buttonParams });

    }

}

export { RootView };