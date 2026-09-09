// Ne déclenche `fn` que `delay` ms après le dernier appel : une frappe au clavier
// ne doit pas produire une requête par caractère.
export function debounce<A extends unknown[]>(fn: (...args: A) => void, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
