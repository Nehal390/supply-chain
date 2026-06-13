let available = true;

export function setDbAvailable(val: boolean): void {
  available = val;
}

export function getDbAvailable(): boolean {
  return available;
}
