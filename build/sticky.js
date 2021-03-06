/**
 * Track your elements on the page like a boss.
 *
 * MIT licensed. By Afshin Mehrabani <afshin.meh@gmail.com>
 *
 * This project is a part of Kissui framework.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return (root.kissuiPosition = factory());
    });
  } else {
    root.kissuiPosition = factory(root);
  }
}(this, function () {
  /**
  * To store all available elements with their options
  */
  var _elements = [];

  /**
  * EventListener
  */
  var _events = [];

  // scroll positions to calc the delta variable in _position function
  var _scrollTop = null;
  var _scrollLeft = null;

  /**
  * options
  */
  var _options = {
    //trigger the events on module init?
    //e.g. when an element is already in the viewport and there is a data-kui-position = "in"
    triggerOnInit: true,
    attribute: 'data-kui-position',
    // to use console.log instead of throw Error
    safeMode: false
  };

  /**
  * all possible events
  */
  _options.events = [
    'in',
    'out',
    'partially',
    'middle',
    'top',
    'bottom',
    'left',
    'center',
    'right'
  ];

  /**
  * Developer friendly console.log / throw Error
  *
  */
  function _error (msg) {
    msg = 'Kissui.position: ' + msg;

    if (_options.safeMode == true) {
      console.log(msg);
    } else {
      throw Error(msg);
    }
  };

  /**
  * Find elements or import them via options (later)
  */
  function _populate () {
    var elements = document.querySelectorAll('*[' + _options.attribute + ']');

    for (var i = 0;i < elements.length;i++) {
      var element = elements[i];
      var event = element.getAttribute(_options.attribute);

      _add(element, event);
    }
  };

  /**
  * Adds a new item to _elements array
  *
  */
  function _add (element, event) {
    var events = event.split(' ');
    // is this valid to add this element? e.g. you can't have `blahblah` as event name
    var valid = true;

    for (var i = 0; i < events.length; i++) {
      var ex = events[i];

      if (_options.events.indexOf(ex) == -1) {
        valid = false;
        break;
      }
    }

    if (valid) {
      _elements.push({
        element: element,
        event: event
      });
    } else {
      _error('Invalid event name: `' + event + '`. Skipping ' + element);
    }
  };

  /**
  * Removes all items in _elements
  */
  function _reset () {
    _elements = [];
  };

  /**
  * To bind an event to browser
  *
  */
  function _addEventListener (event, fn) {
    if (window.addEventListener) { // modern browsers including IE9+
      window.addEventListener(event, fn, false);
    } else if (window.attachEvent) { // IE8 and below
      window.attachEvent('on' + event, fn);
    }
  };

  function _between (n, pos, delta) {
    if (delta > 0) {
      if (pos < n && n < (pos + delta)) {
        return true;
      }
    } else {
      if (pos > n && n > (pos + delta)) {
        return true;
      }
    }

    return false;
  };

  /**
  * Check a single element position and return the correct event name
  *
  */
  function _position (element, event) {
    //element should be added to the page
    //this case happens when element is removed from the page so we ignore the element
    if (element.parentNode == null) return;

    //because we can have compound events
    var elementEvents = event.split(' ');

    //a boolean flag to check if we should trigger the event
    var trigger = true;

    //a flag to process `out` events
    //e.g. `out top`
    var isOut = false;

    //element's position
    var top = element.getBoundingClientRect().top;
    var bottom = element.getBoundingClientRect().bottom;
    var left = element.getBoundingClientRect().left;
    var right = element.getBoundingClientRect().right;
    var elementHeight = element.getBoundingClientRect().height;
    var elementWidth = element.getBoundingClientRect().width;

    //browser's width and height
    var height = window.innerHeight || document.documentElement.clientHeight;
    // to get the width of viewport WITHOUT scrollbar
    var width = document.body.clientWidth || document.documentElement.clientWidth;

    var topDelta = document.body.scrollTop - _scrollTop;
    var leftDelta = document.body.scrollLeft - _scrollLeft;

    // check `in` event
    if (elementEvents.indexOf('in') > -1) {
      if (top >= 0 && left >= 0 && bottom <= height && right <= width) {
        trigger = trigger && true;
      } else {
        trigger = false;
      }
    }

    // check `out` event
    if (elementEvents.indexOf('out') > -1) {
      //to handle the `out {whatever}` events later in this procedure
      isOut = true;

      if (elementEvents.indexOf('partially') > -1) {
        // partially out
        if (top < 0 || left < 0 || right > width || bottom > height) {
          trigger = trigger && true;
        } else {
          trigger = false;
        }
      } else {
        // element is fully out of page
        if ((top + elementHeight) < 0 || (left + elementWidth) < 0 || left > width || top > height) {
          trigger = trigger && true;
        } else {
          trigger = false;
        }
      }
    }

    // check `top` event
    if (elementEvents.indexOf('top') > -1) {
      if (isOut) {
        // it means when the element is out and in the top of the screen
        if (top < 0) {
          trigger = trigger && true;
        } else {
          trigger = false;
        }
      } else {
        if (top == 0 || _between(0, top, topDelta)) {
          trigger = trigger && true;
        } else {
          trigger = false;
        }
      }
    }

    // check `left` event
    if (elementEvents.indexOf('left') > -1) {
      if (left == 0 || _between(0, left, leftDelta)) {
        trigger = trigger && true;
      } else {
        trigger = false;
      }
    }

    // check `right` event
    if (elementEvents.indexOf('right') > -1) {
     if (right == width || _between(width, right, leftDelta)) {
       trigger = trigger && true;
     } else {
       trigger = false;
     }
    }

    // check `bottom` event
    if (elementEvents.indexOf('bottom') > -1) {
     if (bottom == height || _between(height, bottom, topDelta)) {
       trigger = trigger && true;
     } else {
       trigger = false;
     }
    }

    // check `middle` event
    if (elementEvents.indexOf('middle') > -1) {
      if (top + (elementHeight / 2) == (height / 2) || _between((height / 2), top + (elementHeight / 2), topDelta)) {
       trigger = trigger && true;
     } else {
       trigger = false;
     }
    }

    // check `center` event
    if (elementEvents.indexOf('center') > -1) {
     if (left + (elementWidth / 2) == (width / 2) || _between((width / 2), left + (elementWidth / 2), leftDelta)) {
       trigger = trigger && true;
     } else {
       trigger = false;
     }
    }

    if (trigger) {
      if (element.getAttribute('id')) {
        _emit(element.getAttribute('id'), element);
      }

      _emit(event, element);
      _emit('*', element, event);
    }
  };

  /**
  * Checks a list of elements and emits the correct event name
  *
  */
  function _positions (elements) {
    for (var i = 0; i < elements.length; i++) {
      _position.call(this, elements[i].element, elements[i].event);
    };

    _scrollTop = document.body.scrollTop;
    _scrollLeft = document.body.scrollLeft;

    // custom scroll event
    _emit('scroll', {
      top: document.body.scrollTop,
      left: document.body.scrollLeft
    });
  };

  /**
  * listen to an event
  */
  function _on (event, listener) {
    if (typeof _events[event] !== 'object') {
      _events[event] = [];
    }

    _events[event].push(listener);
  };

  /**
  * Emits an event
  */
  function _emit (event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);

    if (typeof _events[event] === 'object') {
      listeners = _events[event].slice();
      length = listeners.length;

      for (i = 0; i < length; i++) {
        listeners[i].apply(this, args);
      }
    }
  };

  /**
  * Removes a listener
  */
  _removeListener = function (event, listener) {
    var idx;

    if (typeof _events[event] === 'object') {
      idx = _events[event].indexOf(listener);

      if (idx > -1) {
        _events[event].splice(idx, 1);
      }
    }
  };

  /**
  * Listen to an event once
  */
  function _once (event, listener) {
    _on(event, function fn () {
      _removeListener(event, fn);
      listener.apply(this, arguments);
    });
  };

  /**
  * Start the module
  */
  function _init () {
    _scrollTop = document.body.scrollTop;
    _scrollLeft = document.body.scrollLeft;

    _populate.call(this);

    if (_options.triggerOnInit == true) {
      _positions.call(this, _elements);
    }

    //after scrolling
    _addEventListener('scroll', _positions.bind(this, _elements));

    //after resizing the browser
    _addEventListener('resize', _positions.bind(this, _elements));
  };

  return {
    _options: _options,
    _elements: _elements,
    on: _on,
    once: _once,
    removeListener: _removeListener,
    init: _init,
    positions: _positions,
    add: _add,
    reset: _reset
  };
}));

/**
 * Sticky position that works everywhere
 *
 * MIT licensed. By Afshin Mehrabani <afshin.meh@gmail.com>
 *
 * This project is a part of Kissui framework.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kissuiPosition'], function (kissuiPosition) {
      return (root.kissuiSticky = factory(kissuiPosition));
    });
  } else {
    root.kissuiSticky = factory(root.kissuiPosition);
  }
}(this, function (kissuiPosition) {

  /**
  * options
  */
  var _options = {
    attribute: 'data-kui-sticky',
    placeholderId: 'kissui-sticky-placeholder-'
  };

  /**
  * To store all available elements with their options
  */
  var _elements = [];

  /**
  * Find elements
  */
  function _populate () {
    //clear old elements first
    _elements = [];

    var elements = document.querySelectorAll('*[' + _options.attribute + ']');

    for (var i = 0;i < elements.length;i++) {
      var element = elements[i];
      var className = element.getAttribute(_options.attribute);
      var opts = {};

      if (className && className != '') {
        opts['className'] = className;
      }

      // to restore the cssText later
      opts['cssText'] = element.style.cssText;

      _add(element, opts);
    }
  };

  /**
  * Adds a new item to _elements array
  */
  function _add (element, opts) {
    _elements.push({
      element: element,
      active: false,
      opts: opts
    });

    kissuiPosition.add(element, 'partially out top');
  };

  /**
  * Finds an element by looking into the _elements
  *
  */
  function _find (element) {
    for (var i = 0;i < _elements.length; i++) {
      var elx = _elements[i];

      if (element === elx.element) {
        return {
          element: elx,
          i: i
        };
      }
    }

    return null;
  };

  /**
  * Restore the classes and removing the placeholder of top event
  *
  */
  function _restoreTop (id, elx) {
    if (elx.active) {
      var element = elx.element;
      elx.active = false;

      // placeholder
      var placeholder = document.getElementById(_options.placeholderId + id);
      placeholder.parentElement.removeChild(placeholder);

      element.className = element.className.replace('kui sticky element', '').trim();

      if (/scrolled/gi.test(element.className)) {
        element.className = element.className.replace('scrolled', '').trim();
      }

      if (typeof (elx.opts.className) != 'undefined') {
        element.className = element.className.replace(elx.opts.className, '').trim();
      }

      element.style.cssText = elx.opts['cssText'];
    }
  };

  /**
  * To handle top event
  *
  */
  function _handleTop (element, event) {

    // is this a pladeholder?
    if (element.id.indexOf(_options.placeholderId) > -1) {
      var id = parseInt(element.getAttribute('data-id'), 10);
      _restoreTop(id, _elements[id]);
    } else {
      var elxObj = _find(element);
      var elx = elxObj.element;

      if (!elx.active) {
        var props = element.getBoundingClientRect();
        var computedStyle = element.currentStyle || window.getComputedStyle(element);

        // adding the placeholder instead of the `fixed` position element
        var placeholder = document.createElement('div');
        placeholder.className = 'kui sticky placeholder'
        // width/height
        placeholder.style.width = props.width + 'px';
        placeholder.style.height = props.height + 'px';
        // margins
        placeholder.style.marginTop = computedStyle.marginTop;
        placeholder.style.marginBottom = computedStyle.marginBottom;
        placeholder.style.marginLeft = computedStyle.marginLeft;
        placeholder.style.marginRight = computedStyle.marginRight;
        // id
        placeholder.id = 'kissui-sticky-placeholder-' + elxObj.i;
        placeholder.setAttribute('data-id', elxObj.i);

        element.parentElement.insertBefore(placeholder, element);

        // adding placeholder to kissuiPosition to be able to restore the element later
        kissuiPosition.add(placeholder, 'in');
        kissuiPosition.add(placeholder, 'top');

        element.className += ' kui sticky element';

        if (typeof (elx.opts.className) != 'undefined') {
          element.className += ' ' + elx.opts.className;
        }

        element.style.cssText += 'left: ' + props.left + 'px!important;';
        element.style.cssText += 'width:' + props.width + 'px!important;';

        var elementHeight = parseInt(computedStyle.marginTop) + props.height;

        if (elementHeight > window.innerHeight) {
          element.style.cssText += 'height: 100%!important;';
          element.className += ' scrolled';
        } else {
          element.style.cssText += 'height:' + props.height + 'px!important;';
        }

        // set element's active flag to true so we can deactivate the sticky position later
        elx.active = true;
      }
    }
  };

  /**
  * Start the module
  */
  function _init () {
    _populate.call(this);

    kissuiPosition.on('top', function (element, event) {
      _handleTop(element, event);
    });

    kissuiPosition.on('in', function (element, event) {
      _handleTop(element, event);
    });

    kissuiPosition.on('partially out top', function (element, event) {
      // it means when the element is completely out of viewport or even partially
      // so we try to call the _handle* method
      if (element.id.indexOf(_options.placeholderId) == -1) {
        // we call this only for non-placeholder elements
        _handleTop(element, event);
      }
    });

    kissuiPosition.init();
  };

  _init();

  return {
    _options: _options,
    _elements: _elements,
    init: _init,
    add: _add
  };
}));
