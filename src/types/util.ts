/*
 * Utility types
 */
export type Nothing = null;
export type Maybe<T> = T | Nothing;
export type Map<K extends string | number | symbol, V> = { [k in K]: V };
export type Dictionary<T> = { [key: string]: T };
export type ValueOf<T> = T[keyof T];
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/*
 * Recursive definition of deep partial without breaking array types
 */
export type DeepPartial<T> = {
  [P in keyof T]?:
    // tslint:disable-next-line:prefer-array-literal
    T[P] extends Array<infer U>
      // tslint:disable-next-line:prefer-array-literal
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : DeepPartial<T[P]>
};
