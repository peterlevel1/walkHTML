;(function (root) {
  var nextTick,
    __Promise = root.Promise,
    slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    isPromise = function (obj) {
      return typeof obj === 'object' && typeof obj.then === 'function';
    },
    defaultResolve = function (value) {
      return value;
    },
    defaultReject = defaultResolve,
    isError = function (o) {
      return !!o && typeof o === 'object' && (
        toString.call(o) === '[object Error]' ||
        o instanceof Error );
    },
    isObject = function (o) {
      return o && toString.call(o) === '[object Object]';
    },
    hasError = function (o) {
      return isError(o) || o === false;
    },
    extendObject = function (o, src) {
      var result = src || {};
      if (isObject(o)) {
        for (var prop in o) {
          if (o.hasOwnProperty(prop)) {
            if (prop === 'then') {
              continue;
            }
            if ( (prop === 'mode' || prop === 'name') && result[prop] ) {
              continue;
            }
            result[prop] = o[prop];
          }
        }
      }
      return result;
    },
    pickArray = function (args) {
      return Array.isArray(args[0]) ?
        args[0] :
        slice.call(args);
    };

  // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
  // cannot handle recursion.
  if (typeof setImmediate === 'function') {
    nextTick = setImmediate;
  }
  else if (typeof process === 'object' && process.nextTick) {
    nextTick = process.nextTick;
  }
  else {
    nextTick = function (cb) {
      setTimeout(cb, 0);
    };
  }

  function settle(commitment, reason, value) {
    var promiseState = commitment._promiseState;

    if (promiseState.isSettled) {
      return;
    }
    promiseState.isSettled = true;
    promiseState.reason = reason;
    promiseState.value = value;

    if (typeof promiseState.waiting === 'function') {
      return promiseState.waiting();
    }

    nextTick(function () {
      if (typeof promiseState.waiting === 'function') {
        promiseState.waiting();
      } else {
        Promise.unset(promiseState);
      }
    });
  }

  function waitForSettle(previousState, onResolving, onRejecting, thenResolve, thenReject) {
    return function () {
      var value,
        failed = !previousState.isResolved,
        reason;

      try {
        value = failed ?
          onRejecting(previousState.reason, previousState.opts) :
          onResolving(previousState.value, previousState.opts);
      } catch (err) {
        reason = err;
      }

      Promise.unset(previousState);

      if (reason) {
        thenReject(reason);
      } else {
        if (!failed) {
          thenResolve(value);
        } else {
          thenReject(value);
        }
      }
    };
  }

  function handleInnerPromise(commitment, innerPromise) {
    var success = function (value) {
        if (Promise.isPromise(value)) {
          handleInnerPromise(commitment, value);
        }
        else {
          settle(commitment, null, value);
        }
      },
      fail = function (reason) {
        commitment._promiseState.isResolved = false;
        commitment._promiseState.isRejected = true;
        settle(commitment, reason);
      };

    try {
      innerPromise.then(success, fail);
    } catch (reason) {
      fail(reason);
    }
  }

  function Promise(fn) {
    if (!(this instanceof Promise)) {
      return new Promise(fn);
    }

    var self = this,
      name;

    self._promiseState = {
      isResolved: false,
      isRejected: false,
      isSettled: false,
      isOver: false,
      reason: null,
      value: null,
      progressValue : null,
      //-----------------
      waiting: null,
      opts : {},
      progressCallback : null,
      doneCallback : null,
      failCallback : null
    };

    self._promiseState._resolve = Promise._resolve.bind(self);
    self._promiseState._reject  = Promise._reject.bind(self);

    if (typeof fn === 'function' && fn.length >= 1) {
      self._promiseState.opts.mode = 'init_fire';

      try {
        fn(self._promiseState._resolve, self._promiseState._reject);
      }
      catch (reason) {
        self._promiseState._reject(reason);
      }

      return self;
    }

    self._promiseState.opts.mode = 'not_init_fire';

    if (!fn) {
      return self;
    }

    if (typeof fn === 'string') {
      self._promiseState.opts.name = fn;
    }
    else if (isObject(fn)) {
      extendObject(fn, self.getOptions());
    }

    name = self._promiseState.opts.name;
    if (name) {
      if (Promise.promises[name]) {
        self._promiseState.opts.name = null;
      }
      else {
        Promise.promises[name] = self;
      }
    }
  }

  Promise._resolve = function (value) {
    var self = this;

    if (self._promiseState.isResolved) {
      return;
    }
    self._promiseState.isResolved = true;

    if (Promise.isPromise(value)) {
      handleInnerPromise(self, value);
    }
    else {
      settle(self, null, value);
    }
  };

  Promise._reject = function (reason) {
    var self = this;

    if (self._promiseState.isRejected) {
      return;
    }
    self._promiseState.isRejected = true;

    settle(self, reason);
  };

  Promise.prototype.ready = function (onResolving, onRejecting) {
    if (this.isPending() && !this._promiseState.waiting) {
      return this.then(onResolving, onRejecting);
    }
  };

  Promise.prototype.then = function (onResolving, onRejecting) {
    var self = this;
    if (!self._promiseState.waiting) {
      return new Promise(function (thenResolve, thenReject) {
        self._promiseState.waiting = waitForSettle(
          self._promiseState,
          onResolving || self._promiseState.doneCallback || defaultResolve,
          onRejecting || self._promiseState.failCallback || defaultReject,
          thenResolve,
          thenReject );
      });
    }

    var error = new Error("Promise.prototype.then: already has waiting!\n");

    if (Promise.debugType === 'development') {
      console.warn(self);
      throw error;
    }
    else if (!self.isSolving()) {
      self.reject(error);
    }
  };

  Promise.promises = {};
  Promise.getPromise = function (name) {
    return (typeof name === 'string' && Promise.promises[name]) ||
      (isPromise(name) && name);
  };

  Promise.factory = function (fn) {
    var commitment;
    if ((commitment = Promise.getPromise(fn)) && commitment.isPending()) {
      return commitment;
    }

    if (!isPromise(fn)) {
      return new Promise(fn);
    }
    else {
      return new Promise();
    }
  };

  Promise.defaultResolve = defaultResolve;
  Promise.defaultReject = defaultReject;
  Promise.isPromise = isPromise;
  Promise.isError = isError;
  Promise.hasError = hasError;
  Promise.noConflict = function () {
    if (__Promise !== void 0) {
      root.Promise = __Promise;
    }
    return Promise;
  };

  Promise.debugType = 'development';
  Promise.setDebugType = function (type) {
    Promise.debugType = type;
  };

  Promise.error = function (err) {
    throw err;
  };

  Promise.logError = function (err) {
    console.log(err);
    return err;
  };

  Promise.reset = function (name, opts) {
    var commitment = isPromise(name) ?
      name :
      Promise.getPromise(name);

    if (commitment && commitment.isOver()) {
      extendObject({
        isResolved: false,
        isRejected: false,
        isSettled: false,
        isOver : false,
        reason: null,
        value: null,
        progressValue : null,
        //********************************************
        _resolve : Promise._resolve.bind(commitment),
        _reject  : Promise._reject.bind(commitment)
      }, commitment._promiseState );

      commitment._promiseState.opts = {
        mode : 'not_init_fire',
        name : commitment._promiseState.opts.name
      };

      if (isObject(opts)) {
        extendObject(opts, commitment.getOptions());
      }

      return commitment;
    }
  };

  Promise.resetAll = function () {
    return tellAll(null, slice.call(arguments), function (action, name, opts) {
      return Promise.reset(name, opts);
    });
  };

  Promise.unset = function (promiseState) {
    extendObject({
      _resolve : null,
      _reject : null,
      waiting : null,
      progressCallback : null,
      doneCallback : null,
      failCallback : null,
      //********************
      isOver : true,
      //********************
      opts: {
        name : promiseState.opts.name,
        mode : promiseState.opts.mode
      }
    }, promiseState );
  };

  function tellAll(action, arr, /**/fn) {
    fn = fn || tellOne;
    var result = arr.reduce(function (memo, v) {
      if (!fn(action, v[0], v[1])) {
        memo.push(v);
      }
      return memo;
    }, []);

    return !result.length ? true : result;
  }

  function tellOne(action, obj, value) {
    if (!/^(resolve|reject|notify)$/.test(action)) {
      return false;
    }

    var commitment = Promise.getPromise(obj);
    if (!commitment || !commitment.isPending()) {
      return false;
    }

    commitment[action](value);
    return true;
  }

  function addStateCallback(who, state, fn) {
    if (
      /^(done|fail|progress)$/.test(state) &&
      who.isPending() &&
      typeof fn === 'function' &&
      !who._promiseState[state + 'Callback']
    ) {
      who._promiseState[state + 'Callback'] = fn;
    }

    return who;
  }

  Promise.makeNodeResolver = function (resolve, reject) {
    if (typeof resolve !== 'function' && isPromise(resolve) && resolve.isPending()) {
      reject = resolve._promiseState._reject;
      resolve = resolve._promiseState._resolve;
    }
    if (typeof resolve !== 'function' || typeof reject !== 'function') {
      throw new Error('Promise.makeNodeResolver: typeof resolve !== \'function\' || typeof reject !== \'function\'');
    }

    return function (err, value) {
      if (hasError(err)) {
        reject(err);
      } else if (arguments.length <= 2) {
        resolve(value);
      } else {
        resolve(core_slice.call(arguments, 1));
      }
    };
  };

  Promise.nodeify = function (nodejsCallback, ctx) {
    return function (value, done, fail) {
      var commitment = new Promise(function (resolve, reject) {
        if (hasError(value)) {
          reject(value);
        }
        else if (Array.isArray(value)) {
          if (hasError(value[0])) {
            reject(value[0]);
          }
          else {
            nodejsCallback.apply((ctx || null), value.concat(Promise.makeNodeResolver(resolve, reject)));
          }
        }
        else {
          nodejsCallback(value, Promise.makeNodeResolver(resolve, reject));
        }
      });

      if (done || fail) {
        return commitment.then(done, fail);
      }

      return commitment;
    };
  };

  function raceOrWaterfall(who, isRace, args) {
    if (!who.isPending()) {
      return who;
    }

    commitments = pickArray(args);
    var resolve = who._promiseState._resolve,
      reject = who._promiseState._reject;

    commitments.forEach(function (commitment, index) {
      if (isPromise(commitment)) {
        if (isRace) {
          commitment.then(resolve, reject);
        }
        else {
          var isPending = commitment.isPending(),
            state = commitment._promiseState;
          who = who.then(
            (isPending && state.doneCallback) || Promise.defaultResolve,
            (isPending && state.failCallback) || Promise.defaultReject );
        }
      }
      else if (typeof commitment === 'function') {
        if (isRace) {
          var ret = commitment();
          if ((isPromise(ret))) {
            ret.then(resolve, reject);
          }
        }
        else {
          who = who.then(commitment, Promise.defaultReject);
        }
      }
    });

    return who;
  }

  ['progress', 'done', 'fail'].forEach(function (state) {
    Promise.prototype[state] = function (fn) {
      return addStateCallback(this, state, fn);
    };
  });

  ['resolve', 'reject', 'notify'].forEach(function (action) {
    Promise[action] = function (o, v) {
      return tellOne(action, o, v);
    };
    //...array[promise or string, v], ...
    Promise[action + 'All'] = function () {
      return tellAll(action, slice.call(arguments));
    };

    Promise.prototype[action] = function (v) {
      if (this.isPending()) {
        if (action === 'notify') {
          if (typeof this._promiseState.progressCallback === 'function') {
            this._promiseState.progressValue = this._promiseState.progressCallback(v);
          }
        }
        else {
          this._promiseState['_' + action](v);
        }
      }
      return this;
    };
  });

  ['waterfall', 'race'].forEach(function (action) {
    var isRace = action === 'race';
    Promise.prototype[action] = function () {
      return raceOrWaterfall(this, isRace, arguments);
    };
  });

  Promise.prototype.value = function () {
    if (this.isResolved()) {
      return this._promiseState.value;
    }
  };

  Promise.prototype.reason = function () {
    if (this.isRejected()) {
      return this._promiseState.reason;
    }
  };

  Promise.prototype.progressValue = function () {
    return this._promiseState.progressValue;
  };

  Promise.prototype.toString = function () {
    return "[object Promise]";
  };

  Promise.prototype.isPending = function () {
    return !this._promiseState.isSettled &&
      !this._promiseState.isResolved &&
      !this._promiseState.isRejected;
  };

  Promise.prototype.isSolving = function () {
    return this._promiseState.isRejected || this._promiseState.isResolved;
  };

  Promise.prototype.isSettled = function () {
    return this._promiseState.isSettled;
  };

  Promise.prototype.isRejected = function () {
    return this._promiseState.isSettled && this._promiseState.isRejected;
  };

  Promise.prototype.isResolved = function () {
    return this._promiseState.isSettled && this._promiseState.isResolved;
  };

  Promise.prototype.isOver = function () {
    return this._promiseState.isSettled && this._promiseState.isOver;
  };

  Promise.prototype.getState = function () {
    return {
      name       : this.name,
      mode       : this._promiseState.mode,
      isRegisted : this.name && !!Promise.promises[this.name],
      isSettled  : this.isSettled(),
      isResolved : this.isResolved(),
      isRejected : this.isRejected(),
      isPending  : this.isPending(),
      isSolving  : this.isSolving(),
      isOver     : this.isOver()
    };
  };

  Promise.prototype["catch"] = function (fn) {
    return this.then(null, fn);
  };

  Promise.prototype.always = function (fn) {
    return this.then(fn, fn);
  };

  Promise.prototype.when = function (/*... promises */) {
    if (!arguments.length || this.isSolving()) {
      return;
    }

    var self = this,
      results = [],
      args = pickArray(arguments),
      len = args.length,
      count = len,
      i = -1,
      commitment,
      options = self.getOptions(),
      timeout = options.timeout,
      progress = function (v) {
        if (v !== void 0) {
          results[this.index] = v;
        }
        if (--count <= 0) {
          self.resolve(results);
        }
      };

    if (typeof timeout === 'number' && timeout > 0) {
      setTimeout(function () {
        var ret;
        if (self.isPending()) {
          if (typeof options.timeoutCallback === 'function') {
            ret = options.timeoutCallback(results);
            if (options.timeoutCallbackOnlyOnce) {
              options.timeoutCallback = null;
            }
          }
          if (ret !== false) {
            self.reject(new Error('Promise.prototype.when: timeout: ' +
              timeout + '\nresults: ' + results));
          }
        }
      }, timeout);
    }

    while (++i < len) {
      commitment = args[i];
      if (!commitment || !isPromise(commitment)) {
        if (typeof commitment === 'function') {
          results[i] = commitment();
        } else {
          results[i] = commitment;
        }
        count--;
      } else {
        commitment.always(progress.bind({index : i}));
      }
    }

    if (!count) {
      progress();
    }
    return self;
  };

  Promise.prototype.option = function (key, value) {
    var options = this._promiseState.opts;

    if (!key) {
      return options;
    }

    if (typeof key === 'string') {
      if (value === void 0) {
        return options[key];
      } else if (!~['name', 'mode', 'then'].indexOf(key)) {
        options[key] = value;
      }
    } else if (isObject(key)) {
      extendObject(key, options);
    }

    return this;
  };

  if (!!root.window && root.window === root) {
    if (typeof define === 'function' && define.amd) {
      define(function () {
        return Promise;
      });
    }
    else {
      root.Promise = Promise;
    }
  }
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  }

})(this);