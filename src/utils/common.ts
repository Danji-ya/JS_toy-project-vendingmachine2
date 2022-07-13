const isFreezableObj = (value: any) =>
  value && typeof value === 'object' && !Object.isFrozen(value);

function deepFreeze(obj: any) {
  Object.keys(obj).forEach((prop) => {
    const value = obj[prop];
    if (isFreezableObj(value)) deepFreeze(value);
  });

  return Object.freeze(obj);
}

export { deepFreeze };
