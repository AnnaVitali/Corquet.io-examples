class RootView extends Croquet.View {

    constructor(model) {
        super(model);
        this.model = model;

        this.subscribe("hologram", "created", this.#attachHologramChild);
        this.subscribe("nearMenu", "created", this.#attachNearMenu);

    }

    #attachHologramChild() {
        new HologramView(model.hologramChildren[model.hologramChildren.length - 1]);
    }

    
    #attachNearMenu() {
        new NearMenuView(model.nearMenuModel);
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
    }
}

export { RootView };