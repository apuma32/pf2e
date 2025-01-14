import type {
    ActorAttributes,
    ActorDetailsSource,
    ActorHitPoints,
    ActorSystemData,
    ActorSystemSource,
    ActorTraitsData,
    ActorTraitsSource,
    AttributeBasedTraceData,
    BaseActorSourcePF2e,
    StrikeData,
} from "@actor/data/base.ts";
import type { DamageDicePF2e, ModifierPF2e, RawModifier, StatisticModifier } from "@actor/modifiers.ts";
import type {
    ActorAlliance,
    AttributeString,
    MovementType,
    SaveType,
    SkillAbbreviation,
    SkillLongForm,
} from "@actor/types.ts";
import { LabeledNumber, ValueAndMax, ValuesList, ZeroToThree } from "@module/data.ts";
import type { ArmorClassTraceData, Statistic } from "@system/statistic/index.ts";
import { PerceptionTraceData } from "@system/statistic/perception.ts";
import type { CreatureActorType, CreatureTrait, SenseAcuity, SenseType, SpecialVisionType } from "./types.ts";
import type { LANGUAGES } from "./values.ts";

type BaseCreatureSource<
    TType extends CreatureActorType,
    TSystemSource extends CreatureSystemSource,
> = BaseActorSourcePF2e<TType, TSystemSource>;

/** Skill and Lore statistics for rolling. */
type CreatureSkills = Record<SkillLongForm, Statistic> & Partial<Record<string, Statistic>>;

interface CreatureSystemSource extends ActorSystemSource {
    details?: CreatureDetailsSource;

    /** Traits, languages, and other information. */
    traits?: CreatureTraitsSource;

    /** Maps roll types -> a list of modifiers which should affect that roll type. */
    customModifiers?: Record<string, RawModifier[]>;

    /** Saving throw data */
    saves?: Record<SaveType, object | undefined>;

    resources?: CreatureResourcesSource;
}

type CreatureDetailsSource = ActorDetailsSource;

type CreatureDetails = {
    /** The alliance this NPC belongs to: relevant to mechanics like flanking */
    alliance: ActorAlliance;
    /** The creature level for this actor */
    level: { value: number };
};

interface CreatureTraitsSource extends ActorTraitsSource<CreatureTrait> {
    /** Languages which this actor knows and can speak. */
    languages: ValuesList<Language>;
}

interface CreatureResourcesSource {
    focus?: {
        value: number;
        max?: number;
    };
}

interface CreatureSystemData extends Omit<CreatureSystemSource, "attributes">, ActorSystemData {
    abilities?: Abilities;

    details: CreatureDetails;

    /** Traits, languages, and other information. */
    traits: CreatureTraitsData;

    attributes: CreatureAttributes;

    /** The perception statistic */
    perception: CreaturePerceptionData;

    /** Maps roll types -> a list of modifiers which should affect that roll type. */
    customModifiers: Record<string, ModifierPF2e[]>;
    /** Maps damage roll types -> a list of damage dice which should be added to that damage roll type. */
    damageDice: Record<string, DamageDicePF2e[]>;

    /** Saving throw data */
    saves: CreatureSaves;

    skills: Record<string, SkillData>;

    actions?: StrikeData[];
    resources?: CreatureResources;
}

type SenseData =
    | { type: SpecialVisionType; acuity?: "precise"; range?: number; source?: Maybe<string> }
    | { type: SenseType; acuity: SenseAcuity; range: number; source?: Maybe<string> };

interface CreaturePerceptionData extends PerceptionTraceData {
    attribute: AttributeString;
}

/** Data describing the value & modifier for a base ability score. */
interface AbilityData {
    /** The modifier for this ability */
    mod: number;
}

type Abilities = Record<AttributeString, AbilityData>;

/** A type representing the possible ability strings. */
type Language = (typeof LANGUAGES)[number];
type Attitude = keyof typeof CONFIG.PF2E.attitude;

interface CreatureTraitsData extends ActorTraitsData<CreatureTrait>, Omit<CreatureTraitsSource, "rarity" | "size"> {
    /** Languages which this actor knows and can speak. */
    languages: ValuesList<Language>;
}

type SkillData = AttributeBasedTraceData;

/** The full save data for a character; including its modifiers and other details */
interface SaveData extends AttributeBasedTraceData {
    saveDetail?: string;
}

type CreatureSaves = Record<SaveType, SaveData>;

/** Miscallenous but mechanically relevant creature attributes.  */
interface CreatureAttributes extends ActorAttributes {
    hp: ActorHitPoints;
    ac: CreatureACData;
    hardness: { value: number };

    /** The creature's natural reach */
    reach: {
        /** The default reach for all actions requiring one */
        base: number;
        /** Its reach for the purpose of manipulate actions, usually the same as its base reach */
        manipulate: number;
    };

    shield?: HeldShieldData;
    speed: CreatureSpeeds;

    /** The current dying level (and maximum) for this creature. */
    dying: ValueAndMax & { recoveryDC: number };
    /** The current wounded level (and maximum) for this creature. */
    wounded: ValueAndMax;
    /** The current doomed level (and maximum) for this creature. */
    doomed: ValueAndMax;

    /** Whether this creature emits sound */
    emitsSound: boolean;
}

interface CreatureACData extends ArmorClassTraceData {
    attribute: AttributeString;
}

interface CreatureSpeeds extends StatisticModifier {
    /** The actor's primary speed (usually walking/stride speed). */
    value: number;
    /** Other speeds that this actor can use (such as swim, climb, etc). */
    otherSpeeds: LabeledSpeed[];
    /** The derived value after applying modifiers, bonuses, and penalties */
    total: number;
}

interface LabeledSpeed extends Omit<LabeledNumber, "exceptions"> {
    type: Exclude<MovementType, "land">;
    source?: string;
    total?: number;
    derivedFromLand?: boolean;
}

/** Creature initiative statistic */
interface CreatureInitiativeSource {
    /** What skill or ability is currently being used to compute initiative. */
    statistic: SkillLongForm | "perception";
}

interface CreatureResources extends CreatureResourcesSource {
    /** The current number of focus points and pool size */
    focus: {
        value: number;
        max: number;
        cap: number;
    };
}

enum VisionLevels {
    BLINDED,
    NORMAL,
    LOWLIGHT,
    DARKVISION,
}

type VisionLevel = ZeroToThree;

/** A PC's or NPC's held shield. An NPC's values can be stored directly on the actor or come from a shield item. */
interface HeldShieldData {
    /** The item ID of the shield if in use or otherwise `null` */
    itemId: string | null;
    /** The name of the shield (defaulting to "Shield" if not from a shield item) */
    name: string;
    /** The shield's AC */
    ac: number;
    /** The shield's hardness */
    hardness: number;
    /** The shield's broken threshold */
    brokenThreshold: number;
    /** The shield's hit points */
    hp: ValueAndMax;
    /** Whether the shield is raised */
    raised: boolean;
    /** Whether the shield is broken */
    broken: boolean;
    /** Whether the shield is destroyed (hp.value === 0) */
    destroyed: boolean;
    /** An effect icon to use when the shield is raised */
    icon: ImageFilePath;
}

export { VisionLevels };
export type {
    Abilities,
    AbilityData,
    Attitude,
    BaseCreatureSource,
    CreatureActorType,
    CreatureAttributes,
    CreatureDetails,
    CreatureDetailsSource,
    CreatureInitiativeSource,
    CreaturePerceptionData,
    CreatureResources,
    CreatureResourcesSource,
    CreatureSaves,
    CreatureSkills,
    CreatureSpeeds,
    CreatureSystemData,
    CreatureSystemSource,
    CreatureTraitsData,
    CreatureTraitsSource,
    HeldShieldData,
    LabeledSpeed,
    Language,
    SaveData,
    SenseData,
    SkillAbbreviation,
    SkillData,
    VisionLevel,
};
