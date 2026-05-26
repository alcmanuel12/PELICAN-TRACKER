const { FULL_ROUTE } = require('./data/route');
const { CHECKPOINT_IDS } = require('./data/constants');

const CHECKPOINT_SET = new Set(CHECKPOINT_IDS);

let _simulationIdx = 0;

const calculateBusPosition = () => FULL_ROUTE[_simulationIdx % FULL_ROUTE.length];

const updateSimulationTimeByStopId = (stopId) => {
    if (!CHECKPOINT_SET.has(Number(stopId))) return false;
    _simulationIdx = Math.floor((Number(stopId) / 27) * FULL_ROUTE.length);
    return true;
};

module.exports = { calculateBusPosition, updateSimulationTimeByStopId };
