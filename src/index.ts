import { Logger as Stokpile } from "./Logger";
import Tampermonkey from "./outputs/Tampermonkey";
import Console from "./outputs/Console";
import Callback from "./outputs/Callback";
const outputs = { Tampermonkey, Console, Callback };
export { Stokpile, outputs };
