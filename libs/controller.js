(function (root, factory) {
	if (typeof module === 'object' && module.exports)
		module.exports = factory(require('events'), require('util'), require('./buildTree.js'));
	else if (typeof define === 'function' && define.amd)
		define(['events', 'ninja', './buildTree'], factory);
	else
		throw new Error('no define or module');
})(this, function (EE, util, buildTree) {

function Controller(opts) {
  EE.call(this);
  if (this.init) {
    if (!isObject(opts)) {
      throw new Error('opts not Object');
    }
    this.init(opts);
  }
}

util.inherits(Controller, EE);

var rmoveText = /\{\{([^}]+)\}\}/g;
var rhasMove = /\{\{([^}]+)\}\}/;
var rioI = /^[$\w-]+/;
var rarg = /--([\w]+)([^-"'}]+|)/g;

Controller.whenNewController = function (cmd) {
  // console.log('new controller ' + cmd.name);
};

Controller.priorityLevel = {
  'if' : 1,
  'escape' : 2
};

Controller.escape = function (str) {
  return (str + '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g,'&#x2F;');
};

Controller.unescape = function (str) {
  return (str + '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g,'/');
};

Controller.walkEvents = {
  start : function (cmd, renderStack) {
    // console.log('start');
  },
  tagStart : function (cmd, args) {
    var one = args[0], index = args[1], node = args[2];
    // console.log('tagStart', one, index);
    if (node.attributes['nt-move'] && !cmd.$curMoves) {
      cmd.$curMoves = cmd.parseMoves(node.attributes['nt-move']);
      cmd.$curMoves.node = node;
      // console.log(cmd.parseMoves(node.attributes['nt-move']));
    }
  },
  single : function (cmd, args) {
    var one = args[0], index = args[1], node = args[2];
    // console.log('single', one, index);
  },
  //there may be another way to do this step:
  // ---> render the tree part by part...
  //1) query the curMoves's node by attributes in real dom
  //2) locate the pos of the node under his parent
  //3) and there may be a chance to compare the prev value with cur value
  tagEnd : function (cmd, args) {
    // console.log('tagEnd', args);
    if (!cmd.$curMoves
    || !cmd.$curMoves.$repeatData
    || cmd.$curMoves.node.istackEnd !== args[1]) {
      if (cmd.$curMoves
      && cmd.$curMoves.node.istackEnd === args[1]) {
        cmd.$curMoves = null;
      }
      return;
    }
    // var one = args[0], index = args[1];
    var node = cmd.$curMoves.node;
    var headTail = node.tagString.split('{{ninja}}');

    var j = -1;
    var repeat = cmd.$curMoves.$repeatData.length;

    var i = -1;
    var len = node.istackEnd - node.istackStart - 1;

    var start = node.istackStart + 1;
    var v;
    var text;

    var one;
    var results = [];
    var end = node.istackEnd + 1;
    var readyRender = cmd.readyRender;

    while (++j < repeat) {
      one = [];

      one.push(headTail[0]);
      while (++i < len) {
        v = readyRender[start + i];

        text = util.isArray(v) ? v[j] : v;
        one.push(text);
      }
      i = -1;
      one.push(headTail[1]);

      results.push(one.join(''));
    }

    readyRender[--start] = results.join('');
    while (++start < end) readyRender[start] = '';

    cmd.$curMoves = null;
  },
  text : function (cmd, args) {
    var one = args[0], index = args[1];
    // console.log('text', one, index);
    if (!one || !cmd.$curMoves || !rhasMove.test(one)) {
      return;
    }

    if (cmd.compile) {
      cmd.$compileArgs.push({
        index : index,
        text : one,
        tag : false,
        args : one.match(rmoveText),
        curMoves : cmd.$curMoves
      });
    }

    cmd.readyRender[index] = Controller.__getText(cmd, one, index);
    // console.log(cmd.readyRender[index]);
  },
  done : function (cmd, renderStack) {
    // console.log('done');
    if (!(cmd.node && cmd.readyRender)) return;

    cmd.$innerHTML = cmd.readyRender.slice(
      cmd.node.istackStart + 2,
      cmd.node.istackEnd - 2
    ).join('');

    if (cmd.$node) {
      cmd.$node.innerHTML = cmd.$innerHTML;
    }

    //======================
    if (cmd.compile && !cmd.prevCompile) {
      cmd.prevCompile = cmd.compile(cmd.tree, cmd.$compileArgs, cmd.data);
    }

    if (cmd.fresh) {
      cmd.tree = buildTree(cmd.readyRender.join(''));
      cmd.renderStack = cmd.tree.renderStack.slice();
      //-------------
      cmd.prevCompile = null;
    }
    // console.log(cmd.tree);
  }
};
Controller.__walkEventNames = Object.keys(Controller.walkEvents);

Controller.__getText = function (cmd, one, index) {
  if (!cmd.$curMoves.$repeatData) {
    return cmd.__getText(one, index, cmd.$curMoves.$data);
  }
  else {
    var i = -1, arr = cmd.$curMoves.$repeatData, len = arr.length,
      ret = [];
    while (++i < len) {
      ret.push(cmd.__getText(one, index, [arr[i], i], true));
    }
    return ret;
  }
};

Controller.prototype.init = function (opts) {
  this.name = opts.name;

  this.node = opts.node;
  this.tree = opts.tree;
  if (!this.node && this.tree) {
    this.node = this.tree[0];
  }
  if (this.tree && this.node) {
    this.renderStack = this.tree.renderStack.slice();
    this.compile = util.isFunction(opts.compile) ? opts.compile : this.compile;
  }
  this.prevCompile = null;

  //=================================
  if (opts.walkEvents) {
    this.setWalkEvents(opts.walkEvents);
  }

  this.$node = opts.$node || null;
  this.data = opts.data || {};
  this.methods = opts.methods || {};
  this.parent = opts.parent || null;
  this.climbingData = !!opts.climbingData;

  this.$curMoves = null;
  this.$allMoves = [];
  this.$compileArgs = [];

  Controller.whenNewController(this);

  if (opts.walk === true && this.renderStack) {
    if (!this.walkEvents) {
      this.setWalkEvents(Controller.walkEvents);
    }
    this.walk();
  }
};

//check if the obj has those events handlers
Controller.prototype.setWalkEvents = function (obj) {
  if (!isObject(obj)) {
    this.walkEvents = null;
    return false;
  }

  var keys = Object.keys(obj), i = -1, l = keys.length, valid = false;
  while (++i < l) {
    if (~Controller.__walkEventNames.indexOf(keys[i])) {
      valid = true;
      break;
    }
  }
  if (valid) this.walkEvents = obj;

  return valid;
};

Controller.prototype.walk = function () {
  this.readyRender = this.renderStack.slice();

  var i = -1, len = this.renderStack.length, one, tree = this.tree,
    renderStack = this.renderStack.slice(), self = this,
    walkEvents = this.walkEvents;

  walkEvents.start && walkEvents.start(self, renderStack);

  //this step could be transferred into async mode
  while (++i < len) {
    one = renderStack[i];
    //tag
    if (i % 2 === 0) {
      //tagEnd
      if (tree.isTagEnd(one)) {
        walkEvents.tagEnd && walkEvents.tagEnd(self, [one, i]);
      }
      //single
      else if (tree.isSingle(one)) {
        walkEvents.single && walkEvents.single(self, [one, i, tree.indexMap[i]]);
      }
      //tagStart
      else {
        walkEvents.tagStart && walkEvents.tagStart(self, [one, i, tree.indexMap[i]]);
      }
    }
    //text
    else {
      walkEvents.text && walkEvents.text(self, [one, i]);
    }
  }

  walkEvents.done && walkEvents.done(self, renderStack);
  this.readyRender = null;
};

// === must escape the value ===
Controller.prototype.__getText = function (one, index, data, isRepeat) {
  var self = this;
  return one.replace(rmoveText, function (all, text) {
    text = text.trim();
    var moves = self.parseMoves(text, data, isRepeat);
    // console.log(moves, text, data);
    if (moves.$ioI == null) {
      throw new Error('no ioI: ' + one);
    }
    text = !moves.length
      ? moves.$ioI
      : self.runTuples(moves.$ioI, moves) + '';
    return Controller.escape(text);
  });
};

Controller.prototype.runTuples = function (ioI, tuples) {
  var i = -1, len = tuples.length, one = '', args, method, tuple;
  while (++i < len) {
    tuple = tuples[i];
    method = this.methods[tuple[0]];
    //--> could be an err, and may emit the err to tell the cmds
    if (!method) continue;

    args = tuple[1].slice();
    args.unshift(one || ioI);
    one = method.apply(this, args);

    if (one === false) return '';
    else if (one === true) return ioI;
  }
  return one || '';
};

Controller.prototype.getValue = function (str, data) {
  var arr = util.isArray(str) ? str : str.match(/[\w-]+/g);
  if (!arr || !arr.length) return void 0;

  data = isObject(data) ? data : this.data || void 0;
  if (!isObject(data)) return void 0;

  var i = -1, len = arr.length;
  while (++i < len && (data = data[arr[i]]) != null) {}

  // if null or void 0, then find parent data
  if (data == null && this.climbingData && this.parent) {
    return this.parent.getValue(arr);
  }
  return data;
};

Controller.prototype.mountEventHandlers = function (opts) {
  var keys = Object.keys(opts),
    len = keys.length, key, handlers, l, j;

  while (len--) {
    key = keys[len];
    handlers = opts[key];
    if (util.isFunction(handlers)) {
      this.on(key, handlers);
    }
    else if (util.isArray(handlers)) {
      l = handlers.length;
      j = -1;
      while (++j < l) {
        if (util.isFunction(handlers[j])) {
          this.on(key, handlers[j]);
        }
      }
    }
  }
};

Controller.prototype.handleMoveArgs = function (moves, one, data, isRepeat) {
  var command = one[1];
  one[2] = (one[2] || '').trim();
  var args = one[2] ? one[2].split(/\s+/) : [];

  if (args.length) {
    if (command === 'repeat' && !moves.$repeatData) {
      // console.log('repeat', one);
      args[0] = this.getValue(args[0], data);
    }
    else {
      var len = args.length;
      while (len--) {
        if (!isRepeat) {
          args[len] = this.getValue(args[len], data);
        }
        else {
          args[len] = (args[len].indexOf('$val') === 0 ||
              (this.$curMoves &&
              this.$curMoves.$val &&
              args[len].indexOf(this.$curMoves.$val) === 0))
            ? (isObject(data[0])
              ? this.getValue(args[len].match(/[$\w-]+/g).slice(1), data[0]) || ''
              : data[0] + '')
            : args[len] === '$index'
            ? data[1]
            : this.getValue(args[len], (this.$curMoves && this.$curMoves.$data));
        }
        if (args[len] == null) args.pop();
      }
    }
  }

  switch (command) {
    case 'ioI':
      if (!moves.$ioI && args[0] != null)
        moves.$ioI = args[0];
      break;
    case 'repeat':
      if (Array.isArray(args[0]) && !moves.$repeatData) {
        moves.$repeatData = args[0];
        if (args[1] && !moves.$val) moves.$val = args[1];
      }
      break;
    case 'data':
      if (isObject(args[0])) {
        if (moves.$data) {
          moves.$prevData = moves.$data;
        }
        moves.$data = args[0];
      }
      break;
    default:
      if (this.methods[command])
        moves.push([command, args]);
      break;
  }

  return moves;
};

Controller.prototype.parseMoves = function (str, data, isRepeat) {
  var moves = [], one;
  while ((one = rarg.exec(str))) {
    this.handleMoveArgs(moves, one, data, isRepeat);
  }

  return moves.length ? this.sortMove(moves) : moves;
};

Controller.prototype.sortMove = function (moves) {
  var p = this.priorityLevel || Controller.priorityLevel;
  return moves.sort(function (a, b) {
    a = a[0];
    b = b[0];
    return p[a] && p[b]
      ? p[a] - p[b]
      : (p[a] && !p[b]) || (!p[a] && !p[b])
      ? -1
      : 1;
  });
};

Controller.prototype.render = function () {};
Controller.prototype.compile = function (tree, compileArgs, data) {};

function isObject(obj) {
  return obj != null && typeof obj === 'object';
}

return Controller;
});

/*
Controller.getMoveText = function (str) {
  var ret = [], one;
  while (one = rmoveText.exec(str)) {
    ret.push(one[1].trim());
  }
  return ret;
}

Controller.makeMoves = function (cmd, node) {
  var moves = node.attributes['nt-move'];
  if (moves && moves !== true) {
    cmd.moves = cmd.parseMoves(moves);
    cmd.moves.node = node;
    cmd.moves.end = node.istackEnd;
    cmd.moves.start = node.istackStart;
    cmd.moves.renderStack = [];
  }
};
  text : function (cmd, args) {
    var one = args[0], index = args[1];
    // console.log('text', one, index);
    var args;
    if (!cmd.$curMoves || !(args = Controller.getMoveText(one)).length) {
      return cmd.readyRender[index] = one;
    }

    if (!cmd.$curMoves.$repeatData) {
      cmd.readyRender[index] = cmd.__getText(args, one, index, cmd.$curMoves.$data);
    }
    else {
      var i = -1, arr = cmd.$curMoves.$repeatData, len = arr.length,
        ret = [];
      while (++i < len) {
        ret.push(cmd.__getText(args, one, index, [arr[i], i], true));
      }
      cmd.readyRender[index] = ret;
    }
    console.log(cmd.readyRender[index]);
  },
Controller.prototype.__getText = function (args, one, index, data, isRepeat) {
  var results = [], i = -1, len = args.length, text, moves,
    j, l;
  while (++i < len) {
    text = args[i];
    moves = this.parseMoves(text, data, isRepeat);
    if (moves.$ioI == null) {
      throw new Error('no ioI: ' + one);
    }
    text = !moves.length
      ? moves.$ioI
      : this.runTuples(moves.$ioI, moves) + '';
    results.push(text);
  }

  i = 0;
  var cb = function () { return results[i++]; };
  text = one.replace(rmoveText, cb);
  cb = null;
  return text;

};
*/