import Logger from '../utils/logger.util';
import Methods from '../utils/method.util';

export default class MasterManager {

    protected logger: Logger;
    protected methods: Methods;

    constructor() {
        this.logger = new Logger();
        this.methods = new Methods();
    }
}