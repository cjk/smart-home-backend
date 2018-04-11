const basicAddr = {
  id: null,
  name: 'unknown',
  value: null,
  story: null,
  room: null,
  type: null,
  func: null,
  fbAddr: null,
  control: null,
  updatedAt: 1451606400000 /* choose guaranteed expired default value so sorting later becomes predictable */,
  verifiedAt: 1451606400000,
};

function createAddress(addr) {
  return { ...basicAddr, ...addr };
}

export default createAddress;
