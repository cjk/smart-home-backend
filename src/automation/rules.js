const daytimeDusk = () => {};
const timeMidnight = () => {};
const runTask = name => {
  console.log(`Running task <${name}>`);
};

const rules = {
  livingRoomEveningLights: {
    on: daytimeDusk,
    off: timeMidnight,
    act: {
      runTask,
      name: 'Szene Abendessen',
    },
  },
};

export default rules;
