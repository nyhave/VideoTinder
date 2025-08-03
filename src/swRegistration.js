export let fcmReg = null;

let resolveReg;
export const fcmRegReady = new Promise(resolve => {
  resolveReg = resolve;
});

export function setFcmReg(reg) {
  fcmReg = reg;
  resolveReg?.(reg);
}
