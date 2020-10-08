export class DependencyTree {
  nodes: Map<symbol, { data: any; require: Set<symbol>; requiredBy: Set<symbol> }> = new Map();

  add(key: symbol, node: any, require: symbol[]) {
    this.nodes.set(key, { require: new Set([...require]), data: node, requiredBy: new Set() });
  }

  resolve() {
    this.inverseRelations();
    return this.getOrderedNodes().map((k: symbol) => this.nodes.get(k).data);
  }

  protected getOrderedNodes(initialMet: Set<symbol> = new Set(), initialUnmet?: Set<symbol>) {
    const unmet = initialUnmet ? initialUnmet : new Set(this.nodes.keys());
    if (unmet.size === 0) {
      return [...initialMet];
    }

    const met = new Set([...initialMet]);
    const stillUnmet: Set<symbol> = new Set();
    const requested: Set<symbol> = new Set();

    for (const nodeId of unmet) {
      const deps = this.nodes.get(nodeId).require;
      // list unmets dependencies
      const unmetDeps = new Set([...deps].filter((x) => !met.has(x)));

      // look for missing deps
      const unresolvableDependencies = new Set([...unmetDeps].filter((x) => !unmet.has(x)));
      if (unresolvableDependencies.size > 0) {
        // if dependency is no resolvable, just warn
        console.warn(
          `Unsolvable extension dependencies : ${[...unresolvableDependencies].map((k) => k.toString()).join(', ')}`,
        );
        [...unresolvableDependencies].forEach((x) => unmetDeps.delete(x));
        // throw new Error(`Unsolvable extension dependencies : ${[...unresolvableDependencies].join(', ')}`);
      }

      // if not unmet, add nodeId to met
      if (unmetDeps.size === 0) {
        met.add(nodeId);
        continue;
      }
      stillUnmet.add(nodeId);
      unmetDeps.forEach((id) => requested.add(id));
    }

    if (requested.size > 0 && new Set([...stillUnmet].filter((x) => !requested.has(x))).size === 0) {
      throw new Error('Circular dependency');
    }

    return this.getOrderedNodes(met, stillUnmet);
  }

  protected inverseRelations() {
    const nodes = this.nodes.entries();
    for (const [nodeId, { requiredBy }] of nodes) {
      for (const req of requiredBy) {
        if (!this.nodes.has(req)) {
          throw new Error(`Unsolvable dependency ${req.toString()}`);
        }
        const requirement = this.nodes.get(req);
        requirement.require.add(nodeId);
      }
    }
  }
}
