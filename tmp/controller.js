(function (root, factory) {
	if (typeof module === 'object' && module.exports)
		module.exports = factory(require('events'), require('util'));
	else if (typeof define === 'function' && define.amd)
		define(['events', 'ninja'], function (EE, util) {
			return factory(EE, util);
		});
	else
		throw new Error('no define or module');
})(this, function (EE, util) {

function Controller(opts) {
  if (!util.isObject(opts)) {
    throw new Error('opts not Object');
  }
  if (this.init) {
    this.init(opts);
  }
}

util.inherits(Controller, EE);

Controller.onWalkMove = function (cmd, node) {
  var moves = node.attributes['nt-move'];
  cmd.moves = [];
  if (moves && moves !== true) {
    cmd.moves = cmd.parseMoves(moves);
    cmd.moves.node = node;
    cmd.moves.end = node.istackEnd;
    cmd.moves.start = node.istackStart;
    cmd.moves.renderStack = [];
    var arr = node.tagString.split('{{ninja}}');
    cmd.moves.head = arr[0];
    cmd.moves.tail = arr[1];
  }
};

var rmoveText = /\{\{([^}]+)\}\}/g;
var rioI = /^[$\w-]+/;
var rhasMove = /--[\w]/;

Controller.handleText = function (cmd, text, data, isRepeat) {
  return text.replace(rmoveText, function (all, moveText) {
    moveText = moveText.trim();
    var ioI = (moveText.match(rioI) || [])[0];
    if (!ioI) return '';

    moveText = moveText.slice(ioI.length).trim();
    ioI = isRepeat
      ? ioI === '$val' ? data[0] :
        ioI === '$index' ? data[1] : ''
      : data[ioI] || '';
    if (!moveText) return ioI;

    return cmd.runTuples(ioI, cmd.parseMoves(moveText));
  });
};

Controller.onWalkText = function (cmd, args) {
  var text = args[0], index = args[1], next = args[2];
  var data = cmd.moves.$repeatData, ret;
  if (!data) {
    data = cmd.moves.$curData || cmd.data;
    if (cmd.tree.isTagEnd(next))
      ret = cmd.moves.head + Controller.handleText(cmd, text, data) + cmd.moves.tail;
    else
      ret = Controller.handleText(cmd, text, data);
    ret = [ret];
  }
  else {
    ret = data.map(function (val, index) {
      return cmd.moves.head +
        Controller.handleText(cmd, text, [val, index], true) +
        cmd.moves.tail;
    });
  }
  if (cmd.tree.isTagEnd(next)) {
    var start = cmd.moves.start, end = cmd.moves.end;
    cmd.readyRender[start] = ret.slice();
    while (++start <= end) cmd.readyRender[start] = '';
  }
  else {
    cmd.readyRender[index] = ret[0];
  }
};

Controller.onMoveDone = function (cmd) {
  console.log('moveDone');
};

Controller.onWalkDone = function (cmd) {
  var ret = [], i = -1, len = cmd.readyRender.length, one, j, l;
  while (++i < len) {
    one = cmd.readyRender[i];
    if (typeof one === 'string') ret.push(one);
    else {
      j = -1;
      l = one.length;
      while (++j < l) ret.push(one[j]);
    }
  }
  cmd.$node.innerHTML = ret.join('');
  console.log('done');
};

Controller.whenNewController = function (cmd) {
  console.log('new controller ' + cmd.name);
};

Controller.priorityLevel = {
  'repeat' : 1,
  'iii' : 3,
  'ppp' : 2
};

Controller.getValue = function (cmd, str) {
  var arr = Array.isArray(str) ? str : str.match(/[\w-]+/g);
  if (!arr || !arr.length) return void 0;

  var data = cmd.data || {}, i = -1, len = arr.length;
  while (++i < len && (data = data[arr[i]]) != null) {}

  // if null or void 0, then find parent data
  if (data == null && cmd.climbingData && cmd.parent) {
    return Controller.getValue(cmd.parent, arr);
  }
  return data;
};

Controller.prototype.init = function (opts) {
  if (!this._events) {
    EE.call(this);
  }
  this.name = opts.name;
  this.node = opts.node;
  this.tree = opts.tree;

  this.$node = opts.$node || null;
  this.data = opts.data || {};
  this.methods = opts.methods || {};
  this.parent = opts.parent || null;
  this.climbingData = !!opts.climbingData;

  this.renderStack = this.tree.renderStack.slice(
    this.node.istackStart,
    this.node.istackEnd
  );
  this.moves = null;

  Controller.whenNewController(this);

  if (opts.walk === true) {
    this.on('walk:move', Controller.onWalkMove);
    this.on('walk:text', Controller.onWalkText);
    this.on('walk:moveDone', Controller.onMoveDone);
    this.on('walk:done', Controller.onWalkDone);
    this.readyRender = this.renderStack.slice();
    this.walk();
  }
};

Controller.prototype.runTuples = function (ioI, tuples) {
  var i = -1, len = tuples.length, one = '', args, method, tuple;
  while (++i < len) {
    tuple = tuples[i];
    method = this.methods[tuple[0]];
    if (!method) continue;

    args = tuple[1].slice();
    args.unshift(one || ioI);
    one = method.apply(this, args);

    if (one === false) return '';
    else if (one === true) return ioI;
  }
  return one || '';
};

Controller.prototype.walk = function () {
  var i = -1, len = this.renderStack.length,
  node = null, renderStack = this.renderStack.slice(), str;
  while (++i < len) {
    //tag
    if (i % 2 === 0) {
      //two:end
      if (this.tree.isTagEnd(renderStack[i])) {
        if (this.moves && this.moves.end === i) {
          this.emit('walk:moveDone', this);
          this.moves = null;
        }
      }
      //single two:start
      else {
        node = this.tree.indexMap[i];
        if (node.attributes['nt-move']) {
          this.emit('walk:move', this, node);
        }
      }
    }
    //text
    else {
      if (this.moves) {
        this.emit('walk:text', this, [renderStack[i], i, renderStack[i + 1]]);
      }
    }
  }

  this.emit('walk:done', this);
};

function isObject(obj) {
  return obj != null && typeof obj === 'object';
}

Controller.prototype.parseMoves = function (str) {
  var rmethods = /--([\w]+)([^-"'}]+|)/g
    , rdata = /^data\:([\w\[\]"']+)/
    , moves = []
    , len
    , one
    , args;
  moves.move = {};

  while ((one = rmethods.exec(str))) {
    if (this.methods[one[1]]) {
      one[2] = one[2].trim();
      args = [];
      if (one[2]) {
        args = one[2].split(/\s+/) || [];
        len = args.length;
        while (len--) {
          args[len] = Controller.getValue(this, args[len]);
          if (args[len] == null) args.pop();
        }
      }
      moves.push([one[1], args]);
      moves.move[one[1]] = true;
      if (one[1] === 'repeat' && Array.isArray(args[0]) &&
        !moves.$repeatData) {
        moves.$repeatData = args[0];
      }
    }
    else if (one[2] && (one = one[2].trim())) {
      if (one = Controller.getValue(this, one.split(/\s+/))) {
        moves.$curData = one;
      }
    }
  }

  return this.sortMove(moves);
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

return Controller;
});