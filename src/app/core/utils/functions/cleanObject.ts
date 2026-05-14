export async function cleanObject(obj: any, optionalObj?: any): Promise<any> {
  const cleanedObject: any = {};

  if (optionalObj) {
    for (const key in optionalObj) {
      if (optionalObj.hasOwnProperty(key) && obj[key] === null) {
        obj[key] = optionalObj[key];
      }
    }
  }
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === null) {
        cleanedObject[key] = typeof obj[key] === 'number' ? 0 : '';
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        cleanedObject[key] = await cleanObject(obj[key]);
      } else {
        cleanedObject[key] = obj[key];
      }
    }
  }
  return cleanedObject;
}