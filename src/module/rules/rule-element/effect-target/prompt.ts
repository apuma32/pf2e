import { ItemPF2e } from "@item";
import { PickAThingConstructorArgs, PickableThing, PickAThingPrompt } from "@module/apps/pick-a-thing-prompt";

/** Prompt the user for the target of the effect they just added to an actor */
export class EffectTargetPrompt extends PickAThingPrompt<Embedded<ItemPF2e>> {
    private scope: "armor" | "weapon";

    constructor(data: TargetPromptData) {
        super(data);
        this.scope = data.scope === "armor" || data.scope === "weapon" ? data.scope : "weapon";
    }

    static override get defaultOptions(): ApplicationOptions {
        const options = super.defaultOptions;
        options.id = "effect-target-prompt";
        return options;
    }

    override get template(): string {
        return "systems/pf2e/templates/system/rules-elements/effect-target-prompt.html";
    }

    /** Collect all options within the specified scope and then eliminate any that fail the predicate test */
    protected override getChoices(): PickableThing<Embedded<ItemPF2e>>[] {
        return ((): PickableThing<Embedded<ItemPF2e>>[] => {
            const { itemTypes } = this.actor;
            switch (this.scope) {
                case "armor": {
                    return itemTypes.armor
                        .filter((armor) => armor.isArmor)
                        .map((armor) => ({
                            value: armor,
                            label: armor.name,
                            img: armor.img,
                            domain: armor.getRollOptions(),
                        }));
                }
                case "weapon": {
                    const itemType = this.actor.type === "character" ? "weapon" : "melee";
                    return itemTypes[itemType].map((weapon) => ({
                        value: weapon,
                        label: weapon.name,
                        img: weapon.img,
                        domain: weapon.getRollOptions(),
                    }));
                }
            }
        })().filter((choice) => this.predicate.test(choice.domain ?? []));
    }
}

interface TargetPromptData extends PickAThingConstructorArgs<Embedded<ItemPF2e>> {
    scope: string;
}
