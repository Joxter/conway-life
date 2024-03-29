// TS clone of https://github.com/copy/life

const LOAD_FACTOR = 0.9;
const INITIAL_SIZE = 16;
const HASHMAP_LIMIT = 24;
const MASK_LEFT = 1;
const MASK_TOP = 2;
const MASK_RIGHT = 4;
const MASK_BOTTOM = 8;

type Bounds = { top: number; left: number; bottom: number; right: number };

export function redraw(node: TreeNode) {
  var size = Math.pow(2, node.level - 1) * 1; //  var size = Math.pow(2, node.level - 1) * drawer.cell_width;

  let grid = Array(size)
    .fill(0)
    .map(() => {
      return Array(size).fill(0);
    });

  draw_node(node, 2 * size, -size, -size);

  return grid
    .map((r) => {
      return r.map((c) => (c ? "X" : ".")).join("");
    })
    .join("\n");

  function draw_node(node: TreeNode, size: number, left: number, top: number) {
    // console.log(
    //   node.population,
    //   node.level,
    //   // size,
    //   // left,
    //   // top,
    //   [size + left, size * 2 + left],
    //   [size + top, size * 2 + top],
    // );
    // console.log("absolute bounds", );
    if (node.population === 0) {
      return;
    }

    if (size <= 1 || node.level === 0) {
      // console.log(">>>>", [left, top]);
      if (node.population) {
        grid[left][top] = 1;
      }
    } else {
      size /= 2;

      draw_node(node.nw, size, left, top);
      draw_node(node.ne, size, left + size, top);
      draw_node(node.sw, size, left, top + size);
      draw_node(node.se, size, left + size, top + size);
    }
  }
}

const BIT_COUNTS = new Int8Array(0x758);
BIT_COUNTS.set([0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4]);

for (var i = 0x10; i < 0x758; i++) {
  BIT_COUNTS[i] = BIT_COUNTS[i & 0xf] + BIT_COUNTS[(i >> 4) & 0xf] + BIT_COUNTS[i >> 8];
}

const POWERS = new Float64Array(1024);
POWERS[0] = 1;
for (let i = 1; i < 1024; i++) {
  POWERS[i] = POWERS[i - 1] * 2;
}

export class LifeUniverse {
  last_id: number;
  hashmap_size: number;
  max_load: number;
  hashmap: (TreeNode | undefined)[];
  empty_tree_cache: TreeNode[];
  level2_cache: TreeNode[];

  rule_b: number;
  rule_s: number;
  root: TreeNode | null;
  rewind_state: TreeNode | null;
  step: number;
  generation: number;

  false_leaf: TreeNode;
  true_leaf: TreeNode;

  constructor() {
    // last id for nodes
    /** @type {number} */
    this.last_id = 0;

    // Size of the hashmap.
    // Always a power of 2 minus 1
    this.hashmap_size = 0;

    // Size when the next GC will happen
    this.max_load = 0;

    // the hashmap
    this.hashmap = [];

    this.empty_tree_cache = [];
    this.level2_cache = [];

    // current rule setting
    this.rule_b = 1 << 3;
    this.rule_s = (1 << 2) | (1 << 3);

    this.root = null;

    this.rewind_state = null;

    /**
     * number of generations to calculate at one time,
     * written as 2^n
     */
    this.step = 0;

    // in which generation are we
    this.generation = 0;

    // living or dead leaf
    this.false_leaf = { id: 3, population: 0, level: 0 } as TreeNode;
    this.true_leaf = { id: 2, population: 1, level: 0 } as TreeNode;

    this.clear_pattern();
  }

  clone(): LifeUniverse {
    let cloned = new LifeUniverse();
    cloned.last_id = this.last_id;
    cloned.hashmap_size = this.hashmap_size;
    cloned.max_load = this.max_load;
    cloned.hashmap = [...this.hashmap];
    cloned.empty_tree_cache = [...this.empty_tree_cache];
    cloned.level2_cache = [...this.level2_cache];
    cloned.root = this.root;
    cloned.rewind_state = this.rewind_state;
    cloned.step = this.step;
    cloned.generation = this.generation;

    return cloned;
  }

  pow2(x: number) {
    if (x >= 1024) return Infinity;

    return POWERS[x];
  }

  save_rewind_state() {
    this.rewind_state = this.root;
  }

  restore_rewind_state() {
    this.generation = 0;
    this.root = this.rewind_state;

    // make sure to rebuild the hashmap, in case its size changed
    this.garbage_collect();
  }

  eval_mask(bitmask: number) {
    var rule = bitmask & 32 ? this.rule_s : this.rule_b;

    return (rule >> BIT_COUNTS[bitmask & 0x757]) & 1;
  }

  level1_create(bitmask: number) {
    return this.create_tree(
      bitmask & 1 ? this.true_leaf : this.false_leaf,
      bitmask & 2 ? this.true_leaf : this.false_leaf,
      bitmask & 4 ? this.true_leaf : this.false_leaf,
      bitmask & 8 ? this.true_leaf : this.false_leaf,
    );
  }

  set_bit(x: number, y: number, living: boolean) {
    var level = this.get_level_from_bounds({ x: x, y: y });

    if (living) {
      while (level > this.root!.level) {
        this.root = this.expand_universe(this.root!);
      }
    } else {
      if (level > this.root!.level) {
        // no need to delete pixels outside of the universe
        return;
      }
    }

    this.root = this.node_set_bit(this.root!, x, y, living);
  }

  get_bit(x: number, y: number) {
    var level = this.get_level_from_bounds({ x: x, y: y });

    if (level > this.root!.level) {
      return false;
    } else {
      return this.node_get_bit(this.root!, x, y);
    }
  }

  get_root_bounds() {
    if (this.root!.population === 0) {
      return {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      };
    }

    var bounds = {
        top: Infinity,
        left: Infinity,
        bottom: -Infinity,
        right: -Infinity,
      },
      offset = this.pow2(this.root!.level - 1);

    this.node_get_boundary(
      this.root!,
      -offset,
      -offset,
      MASK_TOP | MASK_LEFT | MASK_BOTTOM | MASK_RIGHT,
      bounds,
    );

    return bounds;
  }

  empty_tree(level: number) {
    if (this.empty_tree_cache[level]) {
      return this.empty_tree_cache[level];
    }

    var t: TreeNode;

    if (level === 1) {
      t = this.false_leaf;
    } else {
      t = this.empty_tree(level - 1);
    }

    this.empty_tree_cache[level] = this.create_tree(t, t, t, t);
    return this.empty_tree_cache[level];
  }

  expand_universe(node: TreeNode) {
    var t = this.empty_tree(node.level - 1);

    return this.create_tree(
      this.create_tree(t, t, t, node.nw),
      this.create_tree(t, t, node.ne, t),
      this.create_tree(t, node.sw, t, t),
      this.create_tree(node.se, t, t, t),
    );
  }

  // Preserve the tree, but remove all cached
  // generations forward
  uncache(also_quick: boolean) {
    for (var i = 0; i <= this.hashmap_size; i++) {
      var node = this.hashmap[i];

      if (node !== undefined) {
        node.cache = null;
        node.hashmap_next = undefined;

        if (also_quick) node.quick_cache = null;
      }
    }
  }

  // return false if a node is in the hashmap
  in_hashmap(n: TreeNode): boolean {
    var hash = this.calc_hash(n.nw.id, n.ne.id, n.sw.id, n.se.id) & this.hashmap_size,
      node = this.hashmap[hash];

    for (;;) {
      if (node === undefined) {
        return false;
      } else if (node === n) {
        return true;
      }

      node = node.hashmap_next;
    }
  }

  // insert a node into the hashmap
  hashmap_insert(n: TreeNode) {
    var hash = this.calc_hash(n.nw.id, n.ne.id, n.sw.id, n.se.id) & this.hashmap_size,
      node = this.hashmap[hash],
      prev;

    for (;;) {
      if (node === undefined) {
        if (prev !== undefined) {
          prev.hashmap_next = n;
        } else {
          this.hashmap[hash] = n;
        }

        return;
      }
      //else if(node === n)
      //{
      //    // Should not happen
      //}

      prev = node;
      node = node.hashmap_next;
    }
  }

  // create or search for a tree node given its children
  create_tree(nw: TreeNode, ne: TreeNode, sw: TreeNode, se: TreeNode): TreeNode {
    var hash = this.calc_hash(nw.id, ne.id, sw.id, se.id) & this.hashmap_size,
      node = this.hashmap[hash],
      prev;

    for (;;) {
      if (node === undefined) {
        if (this.last_id > this.max_load) {
          this.garbage_collect();
          return this.create_tree(nw, ne, sw, se);
        }

        var new_node = new TreeNode(nw, ne, sw, se, this.last_id++);

        if (prev !== undefined) {
          prev.hashmap_next = new_node;
        } else {
          this.hashmap[hash] = new_node;
        }

        return new_node;
      } else if (node.nw === nw && node.ne === ne && node.sw === sw && node.se === se) {
        return node;
      }
      //console.log("collision hash=" + hash +
      //        " (" + node.nw.id + "," + node.ne.id + "," + node.sw.id + "," + node.se.id + ")" +
      //        " (" + nw.id + "," + ne.id + "," + sw.id + "," + se.id + ")");

      prev = node;
      node = node.hashmap_next;
    }
  }

  next_generation(is_single: boolean) {
    var root = this.root!;

    while (
      (is_single && root.level <= this.step + 2) ||
      root.nw.population !== root.nw.se.se.population ||
      root.ne.population !== root.ne.sw.sw.population ||
      root.sw.population !== root.sw.ne.ne.population ||
      root.se.population !== root.se.nw.nw.population
    ) {
      root = this.expand_universe(root);
    }

    if (is_single) {
      this.generation += this.pow2(this.step);
      root = this.node_next_generation(root);
    } else {
      this.generation += this.pow2(this.root!.level - 2);
      root = this.node_quick_next_generation(root);
    }

    this.root = root;
  }

  garbage_collect(): void {
    //document.getElementById("pattern_name").textContent = last_id + " / " + (last_id / hashmap_size).toFixed(5);
    //console.log("entries: " + this.last_id);
    //console.log("load factor: " + this.last_id / this.hashmap_size);

    //console.log("collecting garbage ...");
    //var t = Date.now();

    if (this.hashmap_size < (1 << HASHMAP_LIMIT) - 1) {
      this.hashmap_size = (this.hashmap_size << 1) | 1;
      this.hashmap = [];
    }

    this.max_load = (this.hashmap_size * LOAD_FACTOR) | 0;

    for (var i = 0; i <= this.hashmap_size; i++) this.hashmap[i] = undefined;

    this.last_id = 4;
    this.node_hash(this.root!);

    //console.log("new entries: " + this.last_id);
    //console.log("population: " + this.root.population);
    //console.log("new hashmap size: " + this.hashmap_size);
    //console.log("GC done in " + (Date.now() - t));
    //console.log("size: " + hashmap.reduce(function(a, x) { return a + (x !== undefined); }, 0));
  }

  // the hash function used for the hashmap
  calc_hash(nw_id: number, ne_id: number, sw_id: number, se_id: number): number {
    //nw_id = nw_id | 0;
    //ne_id = ne_id | 0;
    //sw_id = sw_id | 0;
    //se_id = se_id | 0;

    //var hash = 0;
    //hash = hash + nw_id | 0;
    //nw_id = ne_id + (nw_id << 6) + (nw_id << 16) - nw_id | 0;
    //nw_id = sw_id + (nw_id << 6) + (nw_id << 16) - nw_id | 0;
    //nw_id = se_id + (nw_id << 6) + (nw_id << 16) - nw_id | 0;
    //return nw_id | 0;

    var hash = (((((nw_id * 23) ^ ne_id) * 23) ^ sw_id) * 23) ^ se_id;
    return hash;
  }

  clear_pattern() {
    this.last_id = 4;
    this.hashmap_size = (1 << INITIAL_SIZE) - 1;
    this.max_load = (this.hashmap_size * LOAD_FACTOR) | 0;
    this.hashmap = [];
    this.empty_tree_cache = [];
    this.level2_cache = Array(0x10000);

    for (var i = 0; i <= this.hashmap_size; i++) this.hashmap[i] = undefined;

    this.root = this.empty_tree(3);
    this.generation = 0;
  }

  get_bounds(field_x: number[], field_y: number[]): Bounds {
    if (!field_x.length) {
      return {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      };
    }

    var bounds = {
        top: field_y[0],
        left: field_x[0],
        bottom: field_y[0],
        right: field_x[0],
      },
      len = field_x.length;

    for (var i = 1; i < len; i++) {
      var x = field_x[i],
        y = field_y[i];

      if (x < bounds.left) {
        bounds.left = x;
      } else if (x > bounds.right) {
        bounds.right = x;
      }

      if (y < bounds.top) {
        bounds.top = y;
      } else if (y > bounds.bottom) {
        bounds.bottom = y;
      }
    }

    return bounds;
  }

  /*
   * given a point { x, y } or a bounds object { left, top, bottom, right },
   * return the quadtree level that is required to contain this point
   */
  get_level_from_bounds(bounds: { x: number; y: number } | Bounds) {
    // root should always be at least level 3
    var max = 4,
      keys = Object.keys(bounds);

    for (var i = 0; i < keys.length; i++) {
      // @ts-ignore
      var coordinate: number = bounds[keys[i]];

      if (coordinate + 1 > max) {
        max = coordinate + 1;
      } else if (-coordinate > max) {
        max = -coordinate;
      }
    }

    return Math.ceil(Math.log(max) / Math.LN2) + 1;
  }

  field2tree(field: { x: number; y: number }[], level: number): TreeNode {
    var tree = make_node(),
      len = field.length;

    type Node222 = {
      nw: boolean | Node222;
      ne: boolean | Node222;
      sw: boolean | Node222;
      se: boolean | Node222;
    };

    function make_node(): Node222 {
      return { nw: false, ne: false, sw: false, se: false };
    }

    for (var i = 0; i < len; i++) {
      var x = field[i].x;
      var y = field[i].y;
      var node: Node222 = tree;

      for (var j = level - 2; j >= 0; j--) {
        var offset = this.pow2(j);

        if (x < 0) {
          x += offset;
          if (y < 0) {
            y += offset;
            if (!node.nw) {
              node.nw = make_node();
            }
            // @ts-ignore
            node = node.nw;
          } else {
            y -= offset;
            if (!node.sw) {
              node.sw = make_node();
            }
            // @ts-ignore
            node = node.sw;
          }
        } else {
          x -= offset;
          if (y < 0) {
            y += offset;
            if (!node.ne) {
              node.ne = make_node();
            }
            // @ts-ignore
            node = node.ne;
          } else {
            y -= offset;
            if (!node.se) {
              node.se = make_node();
            }
            // @ts-ignore
            node = node.se;
          }
        }
      }

      if (x < 0) {
        if (y < 0) {
          node.nw = true;
        } else {
          node.sw = true;
        }
      } else {
        if (y < 0) {
          node.ne = true;
        } else {
          node.se = true;
        }
      }
    }

    return tree as TreeNode;
  }

  /*
   * move a field so that (0,0) is in the middle
   */
  make_center(field_x: number[], field_y: number[], bounds: Bounds) {
    var offset_x = Math.round((bounds.left - bounds.right) / 2) - bounds.left,
      offset_y = Math.round((bounds.top - bounds.bottom) / 2) - bounds.top;

    this.move_field(field_x, field_y, offset_x, offset_y);

    bounds.left += offset_x;
    bounds.right += offset_x;
    bounds.top += offset_y;
    bounds.bottom += offset_y;
  }

  move_field(field_x: number[], field_y: number[], offset_x: number, offset_y: number) {
    var len = field_x.length;

    for (var i = 0; i < len; i++) {
      field_x[i] += offset_x;
      field_y[i] += offset_y;
    }
  }

  setup_field(field_x: number[], field_y: number[], bounds: Bounds) {
    if (bounds === undefined) {
      bounds = this.get_bounds(field_x, field_y);
    }

    var level = this.get_level_from_bounds(bounds),
      offset = this.pow2(level - 1),
      count = field_x.length;

    //console.log(field_x, field_y);
    this.move_field(field_x, field_y, offset, offset);

    //console.time("setup");

    //console.time("setup");
    this.root = this.setup_field_recurse(0, count - 1, field_x, field_y, level);
    //console.timeEnd("setup");

    //console.log("entries: " + this.last_id);
    //console.profileEnd("setup");
  }

  partition(
    start: number,
    end: number,
    test_field: number[],
    other_field: number[],
    offset: number,
  ) {
    // Like quicksort's partition: Seperate the values from start to end by
    // the bitmask in offset in the array test_field, returning the middle
    var i = start,
      j = end,
      swap;

    while (i <= j) {
      while (i <= end && (test_field[i] & offset) === 0) {
        i++;
      }

      while (j > start && test_field[j] & offset) {
        j--;
      }

      if (i >= j) {
        break;
      }

      swap = test_field[i];
      test_field[i] = test_field[j];
      test_field[j] = swap;

      swap = other_field[i];
      other_field[i] = other_field[j];
      other_field[j] = swap;

      i++;
      j--;
    }

    return i;
  }

  setup_field_recurse(
    start: number,
    end: number,
    field_x: number[],
    field_y: number[],
    level: number,
  ): TreeNode {
    if (start > end) {
      return this.empty_tree(level);
    }

    if (level === 2) {
      return this.level2_setup(start, end, field_x, field_y);
    }

    level--;

    var offset = 1 << level;
    // here we split the field from start to end into 4 parts:
    //   [Start, part2] -> nw
    //   [Part2, part3] -> ne
    //   [Part3, part4] -> sw
    //   [Part4, end  ] -> se
    //
    // First we split [start, end] into north and south by partitioning
    // by the y coordinates. Next we split the two halfes by the x coordinate.
    var part3 = this.partition(start, end, field_y, field_x, offset);
    var part2 = this.partition(start, part3 - 1, field_x, field_y, offset);
    var part4 = this.partition(part3, end, field_x, field_y, offset);

    return this.create_tree(
      this.setup_field_recurse(start, part2 - 1, field_x, field_y, level),
      this.setup_field_recurse(part2, part3 - 1, field_x, field_y, level),
      this.setup_field_recurse(part3, part4 - 1, field_x, field_y, level),
      this.setup_field_recurse(part4, end, field_x, field_y, level),
    );
  }

  level2_setup(start: number, end: number, field_x: number[], field_y: number[]): TreeNode {
    var set = 0,
      x,
      y;

    for (var i = start; i <= end; i++) {
      x = field_x[i];
      y = field_y[i];

      // interleave 2-bit x and y values
      set |= 1 << ((x & 1) | (((y & 1) | (x & 2)) << 1) | ((y & 2) << 2));
      //set |= 1 << ((0xA820 >> ((y & 3) << 2) | 0x5410 >> ((x & 3) << 2) & 15));
    }

    if (this.level2_cache[set]) {
      return this.level2_cache[set];
    }

    return (this.level2_cache[set] = this.create_tree(
      this.level1_create(set),
      this.level1_create(set >> 4),
      this.level1_create(set >> 8),
      this.level1_create(set >> 12),
    ));
  }

  setup_meta(otca_on: any, otca_off: any, field: any, bounds: Bounds) {
    var level = this.get_level_from_bounds(bounds),
      node = this.field2tree(field, level);

    const setup_meta_from_tree = (node: TreeNode | false, level: number): TreeNode => {
      if (level === 11) {
        return node ? otca_on : otca_off;
      } else if (!node) {
        var dead = setup_meta_from_tree(false, level - 1);

        return this.create_tree(dead, dead, dead, dead);
      } else {
        level--;

        return this.create_tree(
          setup_meta_from_tree(node.nw, level),
          setup_meta_from_tree(node.ne, level),
          setup_meta_from_tree(node.sw, level),
          setup_meta_from_tree(node.se, level),
        );
      }
    };

    this.root = setup_meta_from_tree(node, level + 11);
  }

  get_field(node: TreeNode) {
    let offset = this.pow2(node.level - 1);
    let field: [number, number][] = [];

    this.node_get_field(node, -offset, -offset, field);

    return field;
  }

  // set the base step for generations forward
  set_step(step: number) {
    if (step !== this.step) {
      this.step = step;

      this.uncache(false);
      this.empty_tree_cache = [];
      this.level2_cache = Array(0x10000);
    }
  }

  set_rules(s: number, b: number) {
    if (this.rule_s !== s || this.rule_b !== b) {
      this.rule_s = s;
      this.rule_b = b;

      this.uncache(true);
      this.empty_tree_cache = [];
      this.level2_cache = Array(0x10000);
    }
  }

  node_set_bit(node: TreeNode, x: number, y: number, living: boolean) {
    if (node.level === 0) {
      return living ? this.true_leaf : this.false_leaf;
    }

    var offset = node.level === 1 ? 0 : this.pow2(node.level - 2),
      nw = node.nw,
      ne = node.ne,
      sw = node.sw,
      se = node.se;

    if (x < 0) {
      if (y < 0) {
        nw = this.node_set_bit(nw, x + offset, y + offset, living);
      } else {
        sw = this.node_set_bit(sw, x + offset, y - offset, living);
      }
    } else {
      if (y < 0) {
        ne = this.node_set_bit(ne, x - offset, y + offset, living);
      } else {
        se = this.node_set_bit(se, x - offset, y - offset, living);
      }
    }

    return this.create_tree(nw, ne, sw, se);
  }

  node_get_bit(node: TreeNode, x: number, y: number): boolean {
    if (node.population === 0) {
      return false;
    }
    if (node.level === 0) {
      // other level 0 case is handled above
      return true;
    }

    var offset = node.level === 1 ? 0 : this.pow2(node.level - 2);

    if (x < 0) {
      if (y < 0) {
        return this.node_get_bit(node.nw, x + offset, y + offset);
      } else {
        return this.node_get_bit(node.sw, x + offset, y - offset);
      }
    } else {
      if (y < 0) {
        return this.node_get_bit(node.ne, x - offset, y + offset);
      } else {
        return this.node_get_bit(node.se, x - offset, y - offset);
      }
    }
  }

  node_get_field(node: TreeNode, left: number, top: number, field: [number, number][]) {
    if (node.population === 0) {
      return;
    }

    if (node.level === 0) {
      field.push([left, top]);
    } else {
      var offset = this.pow2(node.level - 1);

      this.node_get_field(node.nw, left, top, field);
      this.node_get_field(node.sw, left, top + offset, field);
      this.node_get_field(node.ne, left + offset, top, field);
      this.node_get_field(node.se, left + offset, top + offset, field);
    }
  }

  node_level2_next(node: TreeNode) {
    var nw = node.nw,
      ne = node.ne,
      sw = node.sw,
      se = node.se,
      bitmask =
        (nw.nw.population << 15) |
        (nw.ne.population << 14) |
        (ne.nw.population << 13) |
        (ne.ne.population << 12) |
        (nw.sw.population << 11) |
        (nw.se.population << 10) |
        (ne.sw.population << 9) |
        (ne.se.population << 8) |
        (sw.nw.population << 7) |
        (sw.ne.population << 6) |
        (se.nw.population << 5) |
        (se.ne.population << 4) |
        (sw.sw.population << 3) |
        (sw.se.population << 2) |
        (se.sw.population << 1) |
        se.se.population;

    return this.level1_create(
      this.eval_mask(bitmask >> 5) |
        (this.eval_mask(bitmask >> 4) << 1) |
        (this.eval_mask(bitmask >> 1) << 2) |
        (this.eval_mask(bitmask) << 3),
    );
  }

  node_next_generation(node: TreeNode): TreeNode {
    if (node.cache) {
      return node.cache;
    }

    if (this.step === node.level - 2) {
      return this.node_quick_next_generation(node);
    }

    if (node.level === 2) {
      if (node.quick_cache) {
        return node.quick_cache;
      } else {
        return (node.quick_cache = this.node_level2_next(node));
      }
    }

    var nw = node.nw,
      ne = node.ne,
      sw = node.sw,
      se = node.se,
      n00 = this.create_tree(nw.nw.se, nw.ne.sw, nw.sw.ne, nw.se.nw),
      n01 = this.create_tree(nw.ne.se, ne.nw.sw, nw.se.ne, ne.sw.nw),
      n02 = this.create_tree(ne.nw.se, ne.ne.sw, ne.sw.ne, ne.se.nw),
      n10 = this.create_tree(nw.sw.se, nw.se.sw, sw.nw.ne, sw.ne.nw),
      n11 = this.create_tree(nw.se.se, ne.sw.sw, sw.ne.ne, se.nw.nw),
      n12 = this.create_tree(ne.sw.se, ne.se.sw, se.nw.ne, se.ne.nw),
      n20 = this.create_tree(sw.nw.se, sw.ne.sw, sw.sw.ne, sw.se.nw),
      n21 = this.create_tree(sw.ne.se, se.nw.sw, sw.se.ne, se.sw.nw),
      n22 = this.create_tree(se.nw.se, se.ne.sw, se.sw.ne, se.se.nw);

    return (node.cache = this.create_tree(
      this.node_next_generation(this.create_tree(n00, n01, n10, n11)),
      this.node_next_generation(this.create_tree(n01, n02, n11, n12)),
      this.node_next_generation(this.create_tree(n10, n11, n20, n21)),
      this.node_next_generation(this.create_tree(n11, n12, n21, n22)),
    ));
  }

  node_quick_next_generation(node: TreeNode): TreeNode {
    if (node.quick_cache !== null) {
      return node.quick_cache;
    }

    if (node.level === 2) {
      return (node.quick_cache = this.node_level2_next(node));
    }

    var nw = node.nw,
      ne = node.ne,
      sw = node.sw,
      se = node.se,
      n00 = this.node_quick_next_generation(nw),
      n01 = this.node_quick_next_generation(this.create_tree(nw.ne, ne.nw, nw.se, ne.sw)),
      n02 = this.node_quick_next_generation(ne),
      n10 = this.node_quick_next_generation(this.create_tree(nw.sw, nw.se, sw.nw, sw.ne)),
      n11 = this.node_quick_next_generation(this.create_tree(nw.se, ne.sw, sw.ne, se.nw)),
      n12 = this.node_quick_next_generation(this.create_tree(ne.sw, ne.se, se.nw, se.ne)),
      n20 = this.node_quick_next_generation(sw),
      n21 = this.node_quick_next_generation(this.create_tree(sw.ne, se.nw, sw.se, se.sw)),
      n22 = this.node_quick_next_generation(se);

    return (node.quick_cache = this.create_tree(
      this.node_quick_next_generation(this.create_tree(n00, n01, n10, n11)),
      this.node_quick_next_generation(this.create_tree(n01, n02, n11, n12)),
      this.node_quick_next_generation(this.create_tree(n10, n11, n20, n21)),
      this.node_quick_next_generation(this.create_tree(n11, n12, n21, n22)),
    ));
  }

  node_hash(node: TreeNode) {
    if (!this.in_hashmap(node)) {
      // Update the id. We have looked for an old id, as
      // the hashmap has been cleared and ids have been
      // reset, but this cannot avoid without iterating
      // the tree twice.
      node.id = this.last_id++;
      node.hashmap_next = undefined;

      if (node.level > 1) {
        this.node_hash(node.nw);
        this.node_hash(node.ne);
        this.node_hash(node.sw);
        this.node_hash(node.se);

        if (node.cache) {
          this.node_hash(node.cache);
        }
        if (node.quick_cache) {
          this.node_hash(node.quick_cache);
        }
      }

      this.hashmap_insert(node);
    }
  }

  node_get_boundary(
    node: TreeNode,
    left: number,
    top: number,
    find_mask: number,
    boundary: { top: number; left: number; bottom: number; right: number },
  ): void {
    if (node.population === 0 || !find_mask) {
      return;
    }

    if (node.level === 0) {
      if (left < boundary.left) boundary.left = left;
      if (left > boundary.right) boundary.right = left;

      if (top < boundary.top) boundary.top = top;
      if (top > boundary.bottom) boundary.bottom = top;
    } else {
      var offset = this.pow2(node.level - 1);

      if (
        left >= boundary.left &&
        left + offset * 2 <= boundary.right &&
        top >= boundary.top &&
        top + offset * 2 <= boundary.bottom
      ) {
        // this square is already inside the found boundary
        return;
      }

      var find_nw = find_mask,
        find_sw = find_mask,
        find_ne = find_mask,
        find_se = find_mask;

      if (node.nw.population) {
        find_sw &= ~MASK_TOP;
        find_ne &= ~MASK_LEFT;
        find_se &= ~MASK_TOP & ~MASK_LEFT;
      }
      if (node.sw.population) {
        find_se &= ~MASK_LEFT;
        find_nw &= ~MASK_BOTTOM;
        find_ne &= ~MASK_BOTTOM & ~MASK_LEFT;
      }
      if (node.ne.population) {
        find_nw &= ~MASK_RIGHT;
        find_se &= ~MASK_TOP;
        find_sw &= ~MASK_TOP & ~MASK_RIGHT;
      }
      if (node.se.population) {
        find_sw &= ~MASK_RIGHT;
        find_ne &= ~MASK_BOTTOM;
        find_nw &= ~MASK_BOTTOM & ~MASK_RIGHT;
      }

      this.node_get_boundary(node.nw, left, top, find_nw, boundary);
      this.node_get_boundary(node.sw, left, top + offset, find_sw, boundary);
      this.node_get_boundary(node.ne, left + offset, top, find_ne, boundary);
      this.node_get_boundary(node.se, left + offset, top + offset, find_se, boundary);
    }
  }
}

class TreeNode {
  nw: TreeNode;
  ne: TreeNode;
  sw: TreeNode;
  se: TreeNode;

  id: number;
  level: number;
  population: number;

  cache: TreeNode | null;
  quick_cache: TreeNode | null;
  hashmap_next: TreeNode | undefined;

  constructor(nw: TreeNode, ne: TreeNode, sw: TreeNode, se: TreeNode, id: number) {
    this.nw = nw;
    this.ne = ne;
    this.sw = sw;
    this.se = se;

    this.id = id;

    // 2^level = width/height of area
    this.level = nw.level + 1;

    this.population = nw.population + ne.population + sw.population + se.population;

    // one generation forward
    this.cache = null;

    // 2^(level - 2) generations forward
    this.quick_cache = null;

    // next entry in the hashmap if this node occupies the same slot
    this.hashmap_next = undefined;

    /*if(this.population === 0)
    {
        this.cache = this.quick_cache = nw;
    }*/
  }
}
