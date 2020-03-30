export function timed<T>(fn: () => T): () => T;
export function timed<A, T>(fn: (a: A) => T): (a: A) => T;
export function timed<A, B, T>(fn: (a: A, b: B) => T): (a: A, b: B) => T;
export function timed<A, B, C, T>(fn: (a: A, b: B, c: C) => T): (a: A, b: B, c: C) => T;
export function timed<A, B, C, D, T>(fn: (a: A, b: B, c: C, d: D) => T): (a: A, b: B, c: C, d: D) => T;

export function timed<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
    return (...args) => {
        const start = new Date().getTime();
        const result = fn(...args);
        const elapsed = new Date().getTime() - start;
        if (result instanceof Promise) {
            result
                .catch(() => {
                    /* no-op */
                })
                .then(() => {
                    console.log(`${fn.name || '<fn>'}: [promise] ${elapsed} ms`, result);
                });
        } else {
            console.log(`${fn.name || '<fn>'}: ${elapsed} ms`, result);
        }
        return result;
    };
}
