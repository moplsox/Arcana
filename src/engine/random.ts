/** 随机数工具：优先使用 crypto 安全随机源，并提供可注入的种子随机数以便测试。 */

export type RNG = () => number;

export const cryptoRandom: RNG = () => {
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const buf = new Uint32Array(1);
    c.getRandomValues(buf);
    return buf[0] / 0x1_0000_0000;
  }
  return Math.random();
};

/** mulberry32 —— 可复现的种子随机数（测试与确定性文案选择用） */
export function seededRandom(seed: number): RNG {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 字符串哈希（FNV-1a），用于从 reading id 派生稳定种子 */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function uid(): string {
  const t = Date.now().toString(36);
  const r = Math.floor(cryptoRandom() * 0xffffffff).toString(36);
  return `${t}-${r}`;
}
