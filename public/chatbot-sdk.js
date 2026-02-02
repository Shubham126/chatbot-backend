var ChatFlowSDK = (function (exports) {
  'use strict';

  function asyncGeneratorStep(n, t, e, r, o, a, c) {
    try {
      var i = n[a](c),
        u = i.value;
    } catch (n) {
      return void e(n);
    }
    i.done ? t(u) : Promise.resolve(u).then(r, o);
  }
  function _asyncToGenerator(n) {
    return function () {
      var t = this,
        e = arguments;
      return new Promise(function (r, o) {
        var a = n.apply(t, e);
        function _next(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
        }
        function _throw(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
        }
        _next(void 0);
      });
    };
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _regenerator() {
    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
    var e,
      t,
      r = "function" == typeof Symbol ? Symbol : {},
      n = r.iterator || "@@iterator",
      o = r.toStringTag || "@@toStringTag";
    function i(r, n, o, i) {
      var c = n && n.prototype instanceof Generator ? n : Generator,
        u = Object.create(c.prototype);
      return _regeneratorDefine(u, "_invoke", function (r, n, o) {
        var i,
          c,
          u,
          f = 0,
          p = o || [],
          y = false,
          G = {
            p: 0,
            n: 0,
            v: e,
            a: d,
            f: d.bind(e, 4),
            d: function (t, r) {
              return i = t, c = 0, u = e, G.n = r, a;
            }
          };
        function d(r, n) {
          for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
            var o,
              i = p[t],
              d = G.p,
              l = i[2];
            r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
          }
          if (o || r > 1) return a;
          throw y = true, n;
        }
        return function (o, p, l) {
          if (f > 1) throw TypeError("Generator is already running");
          for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
            i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
            try {
              if (f = 2, i) {
                if (c || (o = "next"), t = i[o]) {
                  if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                  if (!t.done) return t;
                  u = t.value, c < 2 && (c = 0);
                } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
                i = e;
              } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
            } catch (t) {
              i = e, c = 1, u = t;
            } finally {
              f = 1;
            }
          }
          return {
            value: t,
            done: y
          };
        };
      }(r, o, i), true), u;
    }
    var a = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    t = Object.getPrototypeOf;
    var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
        return this;
      }), t),
      u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
    function f(e) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
      return this;
    }), _regeneratorDefine(u, "toString", function () {
      return "[object Generator]";
    }), (_regenerator = function () {
      return {
        w: i,
        m: f
      };
    })();
  }
  function _regeneratorDefine(e, r, n, t) {
    var i = Object.defineProperty;
    try {
      i({}, "", {});
    } catch (e) {
      i = 0;
    }
    _regeneratorDefine = function (e, r, n, t) {
      if (r) i ? i(e, r, {
        value: n,
        enumerable: !t,
        configurable: !t,
        writable: !t
      }) : e[r] = n;else {
        function o(r, n) {
          _regeneratorDefine(e, r, function (e) {
            return this._invoke(r, n, e);
          });
        }
        o("next", 0), o("throw", 1), o("return", 2);
      }
    }, _regeneratorDefine(e, r, n, t);
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }

  var ChatBot = /*#__PURE__*/function () {
    function ChatBot(apiKey) {
      var _this = this;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      _classCallCheck(this, ChatBot);
      this.apiKey = apiKey;
      // Auto-detect environment for baseUrl
      var isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('127.0.0.1');
      var defaultBaseUrl = isLocalhost ? 'http://localhost:3000/api/scrape' : 'https://chatflow-ai.onrender.com/api/scrape';
      this.baseUrl = options.baseUrl || defaultBaseUrl;
      this.isOpen = false;
      this.currentFileId = null;
      this.chatHistory = [];
      this.selectedFileId = null;
      this.selectedSiteName = null;
      this.websiteTheme = null;

      // Configuration options - will be loaded from API
      this.options = _objectSpread2({
        position: 'bottom-right',
        // Default, will be overridden by API
        theme: 'default',
        themeStyle: 'auto',
        // Will be determined by API
        title: 'ChatFlow AI Assistant',
        placeholder: 'Ask me anything about this website...',
        preselectedSite: null
      }, options);
      this.init();

      // Set up periodic refresh to check for configuration changes
      this.setupConfigRefresh();

      // Add global method for manual refresh
      window.ChatFlowRefresh = function () {
        console.log('🔄 Manual refresh triggered');
        _this.refreshConfiguration();
      };
    }
    return _createClass(ChatBot, [{
      key: "setupConfigRefresh",
      value: function setupConfigRefresh() {
        var _this2 = this;
        // Check for configuration updates every 2 seconds for faster response
        this.configRefreshInterval = setInterval(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
          var _t;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.p = _context.n) {
              case 0:
                _context.p = 0;
                _context.n = 1;
                return _this2.refreshConfiguration();
              case 1:
                _context.n = 3;
                break;
              case 2:
                _context.p = 2;
                _t = _context.v;
                console.warn('Config refresh failed:', _t);
              case 3:
                return _context.a(2);
            }
          }, _callee, null, [[0, 2]]);
        })), 2000);

        // Also refresh when page becomes visible (user switches back to tab)
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden) {
            console.log('🔄 Page visible, checking for config updates...');
            _this2.refreshConfiguration();
          }
        });

        // Refresh when window gains focus
        window.addEventListener('focus', function () {
          console.log('🔄 Window focused, checking for config updates...');
          _this2.refreshConfiguration();
        });
      }
    }, {
      key: "refreshConfiguration",
      value: function () {
        var _refreshConfiguration = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
          var timestamp, response, data, newConfig, configChanged, _t2;
          return _regenerator().w(function (_context2) {
            while (1) switch (_context2.p = _context2.n) {
              case 0:
                _context2.p = 0;
                timestamp = new Date().getTime();
                _context2.n = 1;
                return fetch("".concat(this.baseUrl, "/sdk-config?t=").concat(timestamp), {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                  }
                });
              case 1:
                response = _context2.v;
                _context2.n = 2;
                return response.json();
              case 2:
                data = _context2.v;
                if (!(data.success && data.data)) {
                  _context2.n = 4;
                  break;
                }
                newConfig = data.data; // Check if configuration has changed
                configChanged = this.hasConfigurationChanged(newConfig);
                if (!configChanged) {
                  _context2.n = 4;
                  break;
                }
                console.log('⚡ Configuration changed, updating chatbot immediately...');
                _context2.n = 3;
                return this.applyNewConfiguration(newConfig);
              case 3:
                // Show brief notification to user
                this.showUpdateNotification();
              case 4:
                _context2.n = 6;
                break;
              case 5:
                _context2.p = 5;
                _t2 = _context2.v;
                // Silently fail refresh attempts to avoid spam
                console.debug('Config refresh error:', _t2);
              case 6:
                return _context2.a(2);
            }
          }, _callee2, this, [[0, 5]]);
        }));
        function refreshConfiguration() {
          return _refreshConfiguration.apply(this, arguments);
        }
        return refreshConfiguration;
      }()
    }, {
      key: "hasConfigurationChanged",
      value: function hasConfigurationChanged(newConfig) {
        var _this$sdkConfig$selec, _newConfig$selectedWe, _this$sdkConfig$integ, _newConfig$integratio;
        if (!this.sdkConfig) return true;

        // Check if selected website changed
        var oldWebsiteId = (_this$sdkConfig$selec = this.sdkConfig.selectedWebsite) === null || _this$sdkConfig$selec === void 0 ? void 0 : _this$sdkConfig$selec.id;
        var newWebsiteId = (_newConfig$selectedWe = newConfig.selectedWebsite) === null || _newConfig$selectedWe === void 0 ? void 0 : _newConfig$selectedWe.id;
        if (oldWebsiteId !== newWebsiteId) {
          console.log('📝 Selected website changed:', oldWebsiteId, '->', newWebsiteId);
          return true;
        }

        // Check if theme choice changed
        var oldThemeChoice = (_this$sdkConfig$integ = this.sdkConfig.integration) === null || _this$sdkConfig$integ === void 0 ? void 0 : _this$sdkConfig$integ.themeChoice;
        var newThemeChoice = (_newConfig$integratio = newConfig.integration) === null || _newConfig$integratio === void 0 ? void 0 : _newConfig$integratio.themeChoice;
        if (oldThemeChoice !== newThemeChoice) {
          console.log('🎨 Theme choice changed:', oldThemeChoice, '->', newThemeChoice);
          return true;
        }

        // Check if theme data changed (for website themes)
        if (newThemeChoice === 'website') {
          var oldThemeData = JSON.stringify(this.sdkConfig.themeData || {});
          var newThemeData = JSON.stringify(newConfig.themeData || {});
          if (oldThemeData !== newThemeData) {
            console.log('🎨 Theme data changed');
            return true;
          }
        }
        return false;
      }
    }, {
      key: "applyNewConfiguration",
      value: function () {
        var _applyNewConfiguration = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(newConfig) {
          var customizations, titleElement, inputElement, firstSite;
          return _regenerator().w(function (_context3) {
            while (1) switch (_context3.n) {
              case 0:
                // Store new configuration
                this.sdkConfig = newConfig;

                // Update all settings from new configuration
                if (newConfig.integration.customizations) {
                  customizations = newConfig.integration.customizations; // Update position if changed
                  if (customizations.position && customizations.position !== this.options.position) {
                    this.options.position = customizations.position;
                    // Update widget position class
                    this.widget.className = "chatbot-widget ".concat(this.options.position);
                    console.log('📍 Position updated to:', this.options.position);
                  }

                  // Update title if changed
                  if (customizations.title && customizations.title !== this.options.title) {
                    this.options.title = customizations.title;
                    titleElement = this.widget.querySelector('.chatbot-title');
                    if (titleElement) {
                      titleElement.textContent = customizations.title;
                    }
                    console.log('📝 Title updated to:', this.options.title);
                  }

                  // Update placeholder if changed
                  if (customizations.placeholder && customizations.placeholder !== this.options.placeholder) {
                    this.options.placeholder = customizations.placeholder;
                    inputElement = this.widget.querySelector('#chatbot-input');
                    if (inputElement && !inputElement.disabled) {
                      inputElement.placeholder = customizations.placeholder;
                    }
                    console.log('💬 Placeholder updated to:', this.options.placeholder);
                  }
                }

                // Update theme settings
                if (newConfig.integration.themeChoice === 'website' && newConfig.themeData) {
                  this.options.themeStyle = 'website';
                  this.websiteTheme = newConfig.themeData;
                } else {
                  this.options.themeStyle = 'default';
                  this.websiteTheme = null;
                }

                // Update selected website
                if (newConfig.selectedWebsite) {
                  this.currentFileId = newConfig.selectedWebsite.id;
                  this.enableInput();
                  this.clearChat();
                  // NOTE: I am removing calls to updateChatHeader as per previous request
                } else if (newConfig.availableWebsites.length > 0) {
                  firstSite = newConfig.availableWebsites[0];
                  this.currentFileId = firstSite.id;
                  this.enableInput();
                  this.clearChat();
                  // NOTE: I am removing calls to updateChatHeader as per previous request
                } else {
                  this.showNoSitesMessage();
                }

                // Re-apply styles with new theme
                this.createStyles();
                console.log('✅ Configuration updated successfully');
              case 1:
                return _context3.a(2);
            }
          }, _callee3, this);
        }));
        function applyNewConfiguration(_x) {
          return _applyNewConfiguration.apply(this, arguments);
        }
        return applyNewConfiguration;
      }()
    }, {
      key: "showUpdateNotification",
      value: function showUpdateNotification() {
        // Notification removed - silent updates
      }
    }, {
      key: "init",
      value: function () {
        var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
          var isValidKey;
          return _regenerator().w(function (_context4) {
            while (1) switch (_context4.n) {
              case 0:
                this.createStyles();
                this.createChatWidget();
                this.bindEvents();

                // Validate API key and load SDK configuration
                _context4.n = 1;
                return this.validateApiKey();
              case 1:
                isValidKey = _context4.v;
                if (!isValidKey) {
                  _context4.n = 3;
                  break;
                }
                _context4.n = 2;
                return this.loadSdkConfiguration();
              case 2:
                _context4.n = 4;
                break;
              case 3:
                this.showApiKeyError();
              case 4:
                return _context4.a(2);
            }
          }, _callee4, this);
        }));
        function init() {
          return _init.apply(this, arguments);
        }
        return init;
      }()
    }, {
      key: "validateApiKey",
      value: function () {
        var _validateApiKey = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
          var response, data, _t3;
          return _regenerator().w(function (_context5) {
            while (1) switch (_context5.p = _context5.n) {
              case 0:
                _context5.p = 0;
                _context5.n = 1;
                return fetch("".concat(this.baseUrl.replace('/scrape', ''), "/auth/validate-api-key"), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                  }
                });
              case 1:
                response = _context5.v;
                _context5.n = 2;
                return response.json();
              case 2:
                data = _context5.v;
                return _context5.a(2, data.success);
              case 3:
                _context5.p = 3;
                _t3 = _context5.v;
                console.error('Error validating API key:', _t3);
                return _context5.a(2, false);
            }
          }, _callee5, this, [[0, 3]]);
        }));
        function validateApiKey() {
          return _validateApiKey.apply(this, arguments);
        }
        return validateApiKey;
      }()
    }, {
      key: "showApiKeyError",
      value: function showApiKeyError() {
        var messages = this.widget.querySelector('#chatbot-messages');
        messages.innerHTML = "\n            <div class=\"chatbot-message bot\" style=\"background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;\">\n                <strong>Invalid API Key</strong><br>\n                The provided API key is invalid or has been revoked. Please check your integration settings and ensure you're using a valid API key.\n            </div>\n        ";

        // Disable input
        var input = this.widget.querySelector('#chatbot-input');
        var send = this.widget.querySelector('#chatbot-send');
        input.disabled = true;
        send.disabled = true;
        input.placeholder = 'Invalid API key - chatbot disabled';

        // Hide site selector if it exists
        var selector = this.widget.querySelector('#chatbot-site-selector');
        if (selector) {
          selector.style.display = 'none';
        }
      }
    }, {
      key: "createStyles",
      value: function createStyles() {
        // Create CSS custom properties for theming
        var themeColors = this.getThemeColors();
        console.log('🎨 Creating styles with theme colors:', themeColors);
        var styles = "\n            :root {\n                --chatbot-primary: ".concat(themeColors.primary, ";\n                --chatbot-primary-dark: ").concat(themeColors.primaryDark, ";\n                --chatbot-primary-light: ").concat(themeColors.primaryLight || themeColors.primary, ";\n                --chatbot-secondary: ").concat(themeColors.secondary, ";\n                --chatbot-background: ").concat(themeColors.background, ";\n                --chatbot-text: ").concat(themeColors.text, ";\n                --chatbot-border: ").concat(themeColors.border, ";\n                --chatbot-button: ").concat(themeColors.button || themeColors.primary, ";\n                --chatbot-link: ").concat(themeColors.link || themeColors.primary, ";\n                --chatbot-accent: ").concat(themeColors.accent || themeColors.primary, ";\n                --chatbot-user-bg: ").concat(themeColors.userBg, ";\n                --chatbot-bot-bg: ").concat(themeColors.botBg, ";\n                --chatbot-header-bg: ").concat(themeColors.headerBg || themeColors.primary, ";\n                --chatbot-header-text: ").concat(themeColors.headerText || '#ffffff', ";\n            }\n            .chatbot-widget {\n                position: fixed; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n            }\n            .chatbot-widget.bottom-right { bottom: 20px; right: 20px; }\n            .chatbot-widget.bottom-left { bottom: 20px; left: 20px; }\n            .chatbot-widget.top-right { top: 20px; right: 20px; }\n            .chatbot-widget.top-left { top: 20px; left: 20px; }\n            .chatbot-toggle {\n                width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--chatbot-primary) 0%, var(--chatbot-primary-dark) 100%);\n                border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;\n            }\n            .chatbot-toggle svg { width: 24px; height: 24px; fill: white; }\n            .chatbot-widget .chatbot-container.open ~ .chatbot-toggle {\n                opacity: 0; visibility: hidden; transform: scale(0.8); pointer-events: none;\n            }\n            .chatbot-container {\n                position: absolute; bottom: 0; right: 0; width: 380px; height: 605px; background: var(--chatbot-background);\n                border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column;\n                opacity: 0; visibility: hidden; transform: translateY(20px) scale(0.95); transition: all 0.3s ease; overflow: hidden;\n            }\n            .chatbot-container.open { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }\n            .chatbot-header {\n                background: linear-gradient(135deg, var(--chatbot-header-bg) 0%, var(--chatbot-primary-dark) 100%); color: var(--chatbot-header-text);\n                padding: 16px; display: flex; justify-content: center; align-items: center; border-radius: 12px 12px 0 0; position: relative;\n            }\n            .chatbot-title { font-weight: 600; font-size: 16px; color: var(--chatbot-header-text); text-align: center; flex: 1; }\n            .chatbot-close {\n                background: none; border: none; color: var(--chatbot-header-text); cursor: pointer; padding: 8px; border-radius: 6px;\n                opacity: 0.8; transition: all 0.2s ease; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);\n            }\n            .chatbot-close:hover { background: rgba(255,255,255,0.15); opacity: 1; transform: translateY(-50%) scale(1.1); }\n            .chatbot-messages {\n                flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: var(--chatbot-background);\n            }\n            .chatbot-message { max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.4; }\n            .chatbot-message.user { background: var(--chatbot-user-bg); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }\n            .chatbot-message.bot { background: var(--chatbot-bot-bg); color: var(--chatbot-text); align-self: flex-start; border-bottom-left-radius: 4px; }\n            .bot-message-content { line-height: 1.5; }\n            .bot-title {\n                font-size: 16px; font-weight: 600; color: var(--chatbot-text); margin: 8px 0 12px 0;\n                padding-bottom: 6px; border-bottom: 2px solid var(--chatbot-primary);\n            }\n            .bot-header { font-size: 14px; font-weight: 600; color: var(--chatbot-text); margin: 12px 0 8px 0; }\n            .bot-bullet { margin: 4px 0; padding-left: 8px; color: var(--chatbot-text); }\n            .bot-numbered { margin: 4px 0; padding-left: 8px; color: var(--chatbot-text); font-weight: 500; }\n            .bot-message-content strong { color: var(--chatbot-text); font-weight: 600; }\n            .bot-message-content br { line-height: 1.8; }\n            .chatbot-input-container {\n                padding: 16px; border-top: 1px solid var(--chatbot-border); display: flex; gap: 8px; background: var(--chatbot-background);\n            }\n            .chatbot-input {\n                flex: 1; padding: 12px 16px; border: 1px solid var(--chatbot-border); border-radius: 12px; outline: none; font-size: 14px;\n                background: var(--chatbot-background); color: var(--chatbot-text); resize: none; height: 20px; min-height: 20px; max-height: 20px;\n                line-height: 1.2; font-family: inherit; overflow-y: auto; overflow-x: hidden;\n            }\n            .chatbot-input:focus { border-color: var(--chatbot-primary); }\n            .chatbot-send {\n                width: 40px; height: 40px; border-radius: 50%; background: var(--chatbot-primary); border: none; cursor: pointer;\n                display: flex; align-items: center; justify-content: center; transition: background 0.2s;\n            }\n            .chatbot-send:hover { background: var(--chatbot-primary-dark); }\n            .chatbot-send:disabled { background: #adb5bd; cursor: not-allowed; }\n            .chatbot-send svg { width: 16px; height: 16px; fill: white; }\n            .chatbot-loading-inline {\n                display: flex; align-items: center; gap: 8px; color: var(--chatbot-text); font-size: 14px; opacity: 0.8;\n            }\n            .chatbot-loading-dots { display: flex; gap: 4px; }\n            .chatbot-loading-dot {\n                width: 6px; height: 6px; border-radius: 50%; background: var(--chatbot-primary); animation: chatbot-pulse 1.4s ease-in-out infinite both;\n            }\n            .chatbot-loading-dot:nth-child(1) { animation-delay: -0.32s; }\n            .chatbot-loading-dot:nth-child(2) { animation-delay: -0.16s; }\n            @keyframes chatbot-pulse { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }\n            .chatbot-status { padding: 8px 16px; background: #e3f2fd; color: #1976d2; font-size: 12px; text-align: center; }\n            .chatbot-site-subtitle { font-size: 12px; color: rgba(255, 255, 255, 0.8); margin-top: 2px; font-weight: 400; }\n            \n            /* Enhanced Markdown Styling */\n            .bot-message-content { line-height: 1.6; }\n            .bot-paragraph { margin: 8px 0; }\n            .bot-header { font-size: 18px; font-weight: 600; color: var(--chatbot-text); margin: 16px 0 8px 0; padding-bottom: 4px; border-bottom: 2px solid var(--chatbot-primary); }\n            .bot-subheader { font-size: 16px; font-weight: 600; color: var(--chatbot-text); margin: 12px 0 6px 0; }\n            .bot-bold { font-weight: 600; color: var(--chatbot-text); }\n            .bot-italic { font-style: italic; color: var(--chatbot-text); }\n            .bot-link { color: var(--chatbot-link); text-decoration: none; border-bottom: 1px solid transparent; transition: all 0.2s ease; }\n            .bot-link:hover { border-bottom-color: var(--chatbot-link); text-decoration: none; }\n            .bot-list, .bot-numbered-list { margin: 8px 0; padding-left: 20px; }\n            .bot-list-item { margin: 4px 0; color: var(--chatbot-text); line-height: 1.5; }\n            .bot-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }\n            .bot-table-header { background: var(--chatbot-primary); color: white; padding: 8px 12px; text-align: left; font-weight: 600; }\n            .bot-table-cell { padding: 8px 12px; border: 1px solid var(--chatbot-border); color: var(--chatbot-text); }\n            .bot-table tbody tr:nth-child(even) { background: rgba(0, 0, 0, 0.02); }\n        ");
        var existingStyles = document.getElementById('chatbot-styles');
        if (existingStyles) {
          existingStyles.remove();
        }
        var styleSheet = document.createElement('style');
        styleSheet.id = 'chatbot-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        console.log('✅ Styles applied successfully');
      }
    }, {
      key: "updateStyles",
      value: function updateStyles() {
        console.log('🔄 Updating styles with new theme...');
        this.createStyles();
      }
    }, {
      key: "createChatWidget",
      value: function createChatWidget() {
        var widget = document.createElement('div');
        widget.className = "chatbot-widget ".concat(this.options.position);
        widget.innerHTML = "\n            <button class=\"chatbot-toggle\" id=\"chatbot-toggle\">\n                <svg viewBox=\"0 0 24 24\">\n                    <path d=\"M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z\"/>\n                </svg>\n            </button>\n            <div class=\"chatbot-container\" id=\"chatbot-container\">\n                <div class=\"chatbot-header\">\n                    <div class=\"chatbot-title\">".concat(this.options.title, "</div>\n                    <button class=\"chatbot-close\" id=\"chatbot-close\">\n                        <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n                            <path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/>\n                        </svg>\n                    </button>\n                </div>\n                <div class=\"chatbot-messages\" id=\"chatbot-messages\">\n                    <div class=\"chatbot-message bot\">\n                        Hi! I'm your AI assistant. I'll help you with information from your scraped websites.\n                    </div>\n                </div>\n                <div class=\"chatbot-input-container\">\n                    <textarea class=\"chatbot-input\" id=\"chatbot-input\" placeholder=\"").concat(this.options.placeholder, "\" disabled rows=\"1\"></textarea>\n                    <button class=\"chatbot-send\" id=\"chatbot-send\" disabled>\n                        <svg viewBox=\"0 0 24 24\">\n                            <path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\"/>\n                        </svg>\n                    </button>\n                </div>\n            </div>\n        ");
        document.body.appendChild(widget);
        this.widget = widget;
      }
    }, {
      key: "bindEvents",
      value: function bindEvents() {
        var _this3 = this;
        var toggle = this.widget.querySelector('#chatbot-toggle');
        var close = this.widget.querySelector('#chatbot-close');
        var input = this.widget.querySelector('#chatbot-input');
        var send = this.widget.querySelector('#chatbot-send');
        toggle.addEventListener('click', function () {
          return _this3.toggleChat();
        });
        close.addEventListener('click', function () {
          return _this3.closeChat();
        });
        send.addEventListener('click', function () {
          return _this3.sendMessage();
        });
        input.addEventListener('keypress', function (e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            _this3.sendMessage();
          }
        });
      }
    }, {
      key: "toggleChat",
      value: function toggleChat() {
        this.isOpen = !this.isOpen;
        var container = this.widget.querySelector('#chatbot-container');
        container.classList.toggle('open', this.isOpen);
      }
    }, {
      key: "closeChat",
      value: function closeChat() {
        this.isOpen = false;
        var container = this.widget.querySelector('#chatbot-container');
        container.classList.remove('open');
      }
    }, {
      key: "enableInput",
      value: function enableInput() {
        var input = this.widget.querySelector('#chatbot-input');
        var send = this.widget.querySelector('#chatbot-send');
        input.disabled = false;
        send.disabled = false;
        input.placeholder = this.options.placeholder || 'Ask me anything about this website...';
        input.focus();
      }
    }, {
      key: "sendMessage",
      value: function () {
        var _sendMessage = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
          var input, message, response, data, _t4;
          return _regenerator().w(function (_context6) {
            while (1) switch (_context6.p = _context6.n) {
              case 0:
                input = this.widget.querySelector('#chatbot-input');
                message = input.value.trim();
                if (!(!message || !this.currentFileId)) {
                  _context6.n = 1;
                  break;
                }
                return _context6.a(2);
              case 1:
                this.addMessage(message, 'user');
                input.value = '';
                this.showLoading();
                _context6.p = 2;
                _context6.n = 3;
                return fetch("".concat(this.baseUrl, "/chat"), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                  },
                  body: JSON.stringify({
                    fileId: this.currentFileId,
                    message: message
                  })
                });
              case 3:
                response = _context6.v;
                _context6.n = 4;
                return response.json();
              case 4:
                data = _context6.v;
                this.hideLoading();
                if (data.success) {
                  this.addMessage(data.data.response, 'bot');
                } else {
                  this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                }
                _context6.n = 6;
                break;
              case 5:
                _context6.p = 5;
                _t4 = _context6.v;
                console.error('Error sending message:', _t4);
                this.hideLoading();
                this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
              case 6:
                return _context6.a(2);
            }
          }, _callee6, this, [[2, 5]]);
        }));
        function sendMessage() {
          return _sendMessage.apply(this, arguments);
        }
        return sendMessage;
      }()
    }, {
      key: "addMessage",
      value: function addMessage(text, sender) {
        var messages = this.widget.querySelector('#chatbot-messages');
        var message = document.createElement('div');
        message.className = "chatbot-message ".concat(sender);
        if (sender === 'bot') {
          message.innerHTML = this.formatBotMessage(text);
        } else {
          message.textContent = text;
        }
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
        this.chatHistory.push({
          text: text,
          sender: sender,
          timestamp: new Date()
        });
      }
    }, {
      key: "formatBotMessage",
      value: function formatBotMessage(text) {
        if (!text || typeof text !== 'string') return '';

        // Clean up any malformed AI responses first
        var formatted = this.cleanupAIResponse(text);

        // Process markdown links BEFORE escaping HTML
        formatted = this.processMarkdownLinks(formatted);

        // Escape HTML to prevent any malformed content (but preserve our processed links)
        formatted = this.escapeHtmlExceptLinks(formatted);

        // Convert line breaks to HTML with proper spacing
        formatted = formatted.replace(/\n\n/g, '</p><p class="bot-paragraph">');
        formatted = formatted.replace(/\n/g, '<br>');

        // Process markdown headers (## Header)
        formatted = this.processMarkdownHeaders(formatted);

        // Simple bold formatting for **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="bot-bold">$1</strong>');

        // Simple italic formatting for *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="bot-italic">$1</em>');

        // Process bullet points
        formatted = this.processBulletPoints(formatted);

        // Process numbered lists
        formatted = this.processNumberedLists(formatted);

        // Process markdown tables
        formatted = this.processMarkdownTables(formatted);

        // Clean up any malformed paragraph tags and ensure proper wrapping
        formatted = formatted.replace(/<\/p><p class="bot-paragraph">\s*<\/p>/g, '</p>');
        formatted = formatted.replace(/^<\/p>/, '');
        formatted = formatted.replace(/<p class="bot-paragraph">\s*$/, '');

        // Wrap in paragraph tags if not already wrapped
        if (!formatted.includes('<p class="bot-paragraph">')) {
          formatted = "<p class=\"bot-paragraph\">".concat(formatted, "</p>");
        }

        // Format as a clean response with proper spacing
        return "<div class=\"bot-message-content\">".concat(formatted, "</div>");
      }
    }, {
      key: "cleanupAIResponse",
      value: function cleanupAIResponse(text) {
        // Remove any malformed HTML tags that might cause issues
        return text.replace(/<[^>]*$/g, '') // Remove incomplete HTML tags at end
        .replace(/^[^<]*>/g, '') // Remove incomplete HTML tags at start
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
        .trim();
      }
    }, {
      key: "processMarkdownLinks",
      value: function processMarkdownLinks(text) {
        // Convert markdown links [text](url) to clickable HTML links
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="bot-link">$1</a>');
      }
    }, {
      key: "escapeHtmlExceptLinks",
      value: function escapeHtmlExceptLinks(text) {
        var _this4 = this;
        // Split by HTML link tags to preserve them
        var linkRegex = /(<a[^>]*>.*?<\/a>)/g;
        var parts = text.split(linkRegex);
        return parts.map(function (part) {
          // If this part is a link, preserve it
          if (linkRegex.test(part)) {
            return part;
          }
          // Otherwise, escape HTML
          return _this4.escapeHtml(part);
        }).join('');
      }
    }, {
      key: "processMarkdownHeaders",
      value: function processMarkdownHeaders(text) {
        // Process ## headers
        text = text.replace(/##\s+(.+?)(<br>|$)/g, '<h3 class="bot-header">$1</h3><br>');
        // Process ### headers
        text = text.replace(/###\s+(.+?)(<br>|$)/g, '<h4 class="bot-subheader">$1</h4><br>');
        return text;
      }
    }, {
      key: "processBulletPoints",
      value: function processBulletPoints(text) {
        // Convert bullet points to proper HTML lists
        var lines = text.split('<br>');
        var inList = false;
        var result = [];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.startsWith('• ') || line.startsWith('- ')) {
            if (!inList) {
              result.push('</p><ul class="bot-list"><p class="bot-paragraph">');
              inList = true;
            }
            var content = line.startsWith('• ') ? line.substring(2) : line.substring(2);
            result.push("<li class=\"bot-list-item\">".concat(content, "</li>"));
          } else {
            if (inList) {
              result.push('</p></ul><p class="bot-paragraph">');
              inList = false;
            }
            if (line) {
              result.push(line);
            }
          }
        }
        if (inList) {
          result.push('</p></ul><p class="bot-paragraph">');
        }
        return result.join('<br>');
      }
    }, {
      key: "processNumberedLists",
      value: function processNumberedLists(text) {
        // Convert numbered lists to proper HTML ordered lists
        var lines = text.split('<br>');
        var inList = false;
        var result = [];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();

          // Check for numbered list pattern (1. 2. etc.)
          if (/^\d+\.\s/.test(line)) {
            if (!inList) {
              result.push('</p><ol class="bot-numbered-list"><p class="bot-paragraph">');
              inList = true;
            }
            var content = line.replace(/^\d+\.\s/, '');
            result.push("<li class=\"bot-list-item\">".concat(content, "</li>"));
          } else {
            if (inList) {
              result.push('</p></ol><p class="bot-paragraph">');
              inList = false;
            }
            if (line) {
              result.push(line);
            }
          }
        }
        if (inList) {
          result.push('</p></ol><p class="bot-paragraph">');
        }
        return result.join('<br>');
      }
    }, {
      key: "processMarkdownTables",
      value: function processMarkdownTables(text) {
        // Convert markdown tables to HTML tables
        var lines = text.split('<br>');
        var result = [];
        var inTable = false;
        var tableRows = [];
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();

          // Check if this line is a table row (contains |)
          if (line.includes('|') && line.split('|').length > 2) {
            if (!inTable) {
              inTable = true;
              tableRows = [];
            }

            // Skip separator rows (contains --- or ===)
            if (line.includes('---') || line.includes('===')) {
              continue;
            }

            // Process table row
            var cells = line.split('|').map(function (cell) {
              return cell.trim();
            }).filter(function (cell) {
              return cell;
            });
            tableRows.push(cells);
          } else {
            // If we were in a table, close it
            if (inTable) {
              result.push(this.renderTable(tableRows));
              inTable = false;
              tableRows = [];
            }

            // Add the non-table line
            if (line) {
              result.push(line);
            }
          }
        }

        // Close table if we ended while in one
        if (inTable) {
          result.push(this.renderTable(tableRows));
        }
        return result.join('<br>');
      }
    }, {
      key: "renderTable",
      value: function renderTable(rows) {
        if (rows.length === 0) return '';
        var html = '<table class="bot-table">';

        // First row is header
        if (rows.length > 0) {
          html += '<thead><tr>';
          rows[0].forEach(function (cell) {
            html += "<th class=\"bot-table-header\">".concat(cell, "</th>");
          });
          html += '</tr></thead>';
        }

        // Remaining rows are body
        if (rows.length > 1) {
          html += '<tbody>';
          for (var i = 1; i < rows.length; i++) {
            html += '<tr>';
            rows[i].forEach(function (cell) {
              html += "<td class=\"bot-table-cell\">".concat(cell, "</td>");
            });
            html += '</tr>';
          }
          html += '</tbody>';
        }
        html += '</table>';
        return html;
      }
    }, {
      key: "escapeHtml",
      value: function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
    }, {
      key: "showLoading",
      value: function showLoading() {
        var messages = this.widget.querySelector('#chatbot-messages');
        var loading = document.createElement('div');
        loading.className = 'chatbot-message bot';
        loading.id = 'chatbot-loading';
        loading.innerHTML = "\n            <div class=\"bot-message-content\">\n                <div class=\"chatbot-loading-inline\">\n                    <span>AI is thinking</span>\n                    <div class=\"chatbot-loading-dots\">\n                        <div class=\"chatbot-loading-dot\"></div>\n                        <div class=\"chatbot-loading-dot\"></div>\n                        <div class=\"chatbot-loading-dot\"></div>\n                    </div>\n                </div>\n            </div>\n        ";
        messages.appendChild(loading);
        messages.scrollTop = messages.scrollHeight;
      }
    }, {
      key: "hideLoading",
      value: function hideLoading() {
        var loading = this.widget.querySelector('#chatbot-loading');
        if (loading) loading.remove();
      }
    }, {
      key: "showNoSitesMessage",
      value: function showNoSitesMessage() {
        var messagesContainer = this.widget.querySelector('#chatbot-messages');
        messagesContainer.innerHTML = "\n            <div class=\"chatbot-message bot\">\n                <div class=\"bot-message-content\">\n                    <div class=\"bot-title\">No websites available</div>\n                    <p>No scraped websites found for this API key. Please scrape some websites first using the dashboard.</p>\n                </div>\n            </div>\n        ";
        var input = this.widget.querySelector('#chatbot-input');
        var sendButton = this.widget.querySelector('#chatbot-send');
        if (input) {
          input.disabled = true;
          input.placeholder = 'No websites available for chat';
        }
        if (sendButton) {
          sendButton.disabled = true;
        }
      }
    }, {
      key: "selectSite",
      value: function () {
        var _selectSite = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(fileId, siteName, siteUrl) {
          return _regenerator().w(function (_context7) {
            while (1) switch (_context7.n) {
              case 0:
                console.log('🎯 Selecting site:', siteName, 'with fileId:', fileId);
                this.currentFileId = fileId;
                this.enableInput();
                this.clearChat();
                console.log('🔄 Starting theme auto-detection...');
                _context7.n = 1;
                return this.autoDetectAndLoadTheme(fileId);
              case 1:
                console.log('✅ Theme auto-detection completed');
              case 2:
                return _context7.a(2);
            }
          }, _callee7, this);
        }));
        function selectSite(_x2, _x3, _x4) {
          return _selectSite.apply(this, arguments);
        }
        return selectSite;
      }()
    }, {
      key: "clearChat",
      value: function clearChat() {
        var messages = this.widget.querySelector('#chatbot-messages');
        var welcomeMessage = this.currentFileId ? "Hi! I'm ready to answer questions about the selected website. How can I help you?" : "Hi! I'm your AI assistant. Please select a website from the dropdown above to start chatting about its content.";
        messages.innerHTML = "<div class=\"chatbot-message bot\">".concat(welcomeMessage, "</div>");
        this.chatHistory = [];
      }

      // Public API methods
    }, {
      key: "open",
      value: function open() {
        this.isOpen = true;
        var container = this.widget.querySelector('#chatbot-container');
        container.classList.add('open');
      }
    }, {
      key: "close",
      value: function close() {
        this.closeChat();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (this.configRefreshInterval) {
          clearInterval(this.configRefreshInterval);
        }
        if (this.widget) {
          this.widget.remove();
        }
      }

      // Load complete SDK configuration from API
    }, {
      key: "loadSdkConfiguration",
      value: function () {
        var _loadSdkConfiguration = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
          var timestamp, response, data, config, _config$integration$c, position, title, placeholder, firstSite, _t5;
          return _regenerator().w(function (_context8) {
            while (1) switch (_context8.p = _context8.n) {
              case 0:
                _context8.p = 0;
                console.log('🔧 Loading SDK configuration from API...');
                timestamp = new Date().getTime();
                _context8.n = 1;
                return fetch("".concat(this.baseUrl, "/sdk-config?t=").concat(timestamp), {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                  }
                });
              case 1:
                response = _context8.v;
                _context8.n = 2;
                return response.json();
              case 2:
                data = _context8.v;
                console.log('📊 SDK Config Response:', data);
                if (data.success && data.data) {
                  config = data.data;
                  this.sdkConfig = config;
                  console.log('🔧 Applying configuration from API...');
                  if (config.integration.customizations) {
                    _config$integration$c = config.integration.customizations, position = _config$integration$c.position, title = _config$integration$c.title, placeholder = _config$integration$c.placeholder;
                    if (position) this.options.position = position;
                    if (title) this.options.title = title;
                    if (placeholder) this.options.placeholder = placeholder;
                  }
                  if (config.integration.themeChoice === 'website' && config.themeData) {
                    this.options.themeStyle = 'website';
                    this.websiteTheme = config.themeData;
                  } else {
                    this.options.themeStyle = 'default';
                  }
                  if (config.selectedWebsite) {
                    this.currentFileId = config.selectedWebsite.id;
                    this.enableInput();
                    this.clearChat();
                  } else if (config.availableWebsites.length > 0) {
                    firstSite = config.availableWebsites[0];
                    this.currentFileId = firstSite.id;
                    this.enableInput();
                    this.clearChat();
                  } else {
                    this.showNoSitesMessage();
                  }
                  this.createStyles();
                } else {
                  console.error('❌ Failed to load SDK configuration');
                  this.showNoSitesMessage();
                }
                _context8.n = 4;
                break;
              case 3:
                _context8.p = 3;
                _t5 = _context8.v;
                console.error('❌ Error loading SDK configuration:', _t5);
                this.showNoSitesMessage();
              case 4:
                return _context8.a(2);
            }
          }, _callee8, this, [[0, 3]]);
        }));
        function loadSdkConfiguration() {
          return _loadSdkConfiguration.apply(this, arguments);
        }
        return loadSdkConfiguration;
      }() // Theme management methods
    }, {
      key: "getThemeColors",
      value: function getThemeColors() {
        if (this.options.themeStyle === 'website' && this.websiteTheme && this.websiteTheme.colors) {
          var colors = this.websiteTheme.colors;
          var hasValidPrimary = colors.primary && this.isWebsiteSpecificColor(colors.primary);
          if (!hasValidPrimary) {
            return this.getDefaultThemeColors();
          }
          var themeColors = {
            primary: colors.primary,
            primaryDark: this.darkenColor(colors.primary, 20),
            primaryLight: this.lightenColor(colors.primary, 20),
            secondary: colors.secondary || this.adjustColorBrightness(colors.primary, -15),
            background: colors.background || '#ffffff',
            text: colors.text || this.getContrastingTextColor(colors.background || '#ffffff'),
            border: colors.border || this.adjustColorBrightness(colors.background || '#ffffff', -8),
            button: colors.button || colors.primary,
            link: colors.link || colors.primary,
            accent: colors.accent || colors.primary,
            userBg: colors.primary,
            botBg: this.generateBotBackgroundColor(colors),
            headerBg: colors.primary,
            headerText: this.getContrastingTextColor(colors.primary)
          };
          return this.ensureAccessibleColors(themeColors);
        }
        return this.getDefaultThemeColors();
      }
    }, {
      key: "getDefaultThemeColors",
      value: function getDefaultThemeColors() {
        return {
          primary: '#667eea',
          primaryDark: '#5a6fd8',
          primaryLight: '#7c8bf0',
          secondary: '#6c757d',
          background: '#ffffff',
          text: '#333333',
          border: '#dee2e6',
          button: '#667eea',
          link: '#667eea',
          accent: '#667eea',
          userBg: '#667eea',
          botBg: '#f1f3f5',
          headerBg: '#667eea',
          headerText: '#ffffff'
        };
      }
    }, {
      key: "isWebsiteSpecificColor",
      value: function isWebsiteSpecificColor(color) {
        if (!color) return false;
        var normalizedColor = color.toLowerCase().trim();
        var genericColors = ['#ffffff', '#fff', 'white', '#000000', '#000', 'black', '#333333', '#333', '#666666', '#666', '#999999', '#999', '#cccccc', '#ccc', '#f0f0f0', '#f5f5f5', '#fafafa', '#007bff', '#0056b3', '#0d6efd', '#dc3545', '#28a745', '#ffc107', '#17a2b8', '#6c757d', '#343a40', '#667eea', '#764ba2'];
        if (genericColors.includes(normalizedColor)) return false;
        if (this.isColorTooLight(normalizedColor) || this.isColorTooDark(normalizedColor)) return false;
        return this.hasGoodSaturation(normalizedColor);
      }
    }, {
      key: "isColorTooLight",
      value: function isColorTooLight(color) {
        var hex = color.replace('#', '');
        if (hex.length !== 6) return false;
        var r = parseInt(hex.substr(0, 2), 16);
        var g = parseInt(hex.substr(2, 2), 16);
        var b = parseInt(hex.substr(4, 2), 16);
        var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.9;
      }
    }, {
      key: "isColorTooDark",
      value: function isColorTooDark(color) {
        var hex = color.replace('#', '');
        if (hex.length !== 6) return false;
        var r = parseInt(hex.substr(0, 2), 16);
        var g = parseInt(hex.substr(2, 2), 16);
        var b = parseInt(hex.substr(4, 2), 16);
        var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.1;
      }
    }, {
      key: "hasGoodSaturation",
      value: function hasGoodSaturation(color) {
        var hex = color.replace('#', '');
        if (hex.length !== 6) return false;
        var r = parseInt(hex.substr(0, 2), 16);
        var g = parseInt(hex.substr(2, 2), 16);
        var b = parseInt(hex.substr(4, 2), 16);
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var saturation = max === 0 ? 0 : (max - min) / max;
        return saturation > 0.15;
      }
    }, {
      key: "generateBotBackgroundColor",
      value: function generateBotBackgroundColor(colors) {
        if (colors.secondary && colors.secondary !== colors.primary) {
          return this.lightenColor(colors.secondary, 60);
        } else if (colors.primary) {
          return this.lightenColor(colors.primary, 75);
        }
        return '#f1f3f5';
      }
    }, {
      key: "getContrastingTextColor",
      value: function getContrastingTextColor(backgroundColor) {
        return this.isLightColor(backgroundColor) ? '#ffffff' : '#2d3748';
      }
    }, {
      key: "ensureAccessibleColors",
      value: function ensureAccessibleColors(colors) {
        if (this.isLightColor(colors.background) && this.isLightColor(colors.text)) {
          colors.text = '#2d3748';
        } else if (this.isDarkColor(colors.background) && this.isDarkColor(colors.text)) {
          colors.text = '#f7fafc';
        }
        if (this.isLightColor(colors.botBg) && this.isLightColor(colors.text)) {
          colors.botBg = '#f8f9fa';
        } else if (this.isDarkColor(colors.botBg) && this.isDarkColor(colors.text)) {
          colors.botBg = '#e2e8f0';
        }
        if (this.isColorTooSimilar(colors.primary, colors.background)) {
          colors.primary = this.isLightColor(colors.background) ? '#4299e1' : '#63b3ed';
        }
        return colors;
      }
    }, {
      key: "isLightColor",
      value: function isLightColor(color) {
        if (!color || color === 'transparent') return true;
        if (color.startsWith('#')) {
          var hex = color.slice(1);
          var r = parseInt(hex.substr(0, 2), 16);
          var g = parseInt(hex.substr(2, 2), 16);
          var b = parseInt(hex.substr(4, 2), 16);
          var brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness > 155;
        }
        return true;
      }
    }, {
      key: "isDarkColor",
      value: function isDarkColor(color) {
        return !this.isLightColor(color);
      }
    }, {
      key: "isColorTooSimilar",
      value: function isColorTooSimilar(color1, color2) {
        if (!color1 || !color2 || !color1.startsWith('#') || !color2.startsWith('#')) return false;
        var hex1 = color1.slice(1);
        var hex2 = color2.slice(1);
        var r1 = parseInt(hex1.substr(0, 2), 16),
          g1 = parseInt(hex1.substr(2, 2), 16),
          b1 = parseInt(hex1.substr(4, 2), 16);
        var r2 = parseInt(hex2.substr(0, 2), 16),
          g2 = parseInt(hex2.substr(2, 2), 16),
          b2 = parseInt(hex2.substr(4, 2), 16);
        var distance = Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
        return distance < 100;
      }
    }, {
      key: "autoDetectAndLoadTheme",
      value: function () {
        var _autoDetectAndLoadTheme = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(fileId) {
          var themeLoaded, _t6;
          return _regenerator().w(function (_context9) {
            while (1) switch (_context9.p = _context9.n) {
              case 0:
                _context9.p = 0;
                if (!(this.options.themeStyle === 'default')) {
                  _context9.n = 1;
                  break;
                }
                return _context9.a(2, false);
              case 1:
                _context9.n = 2;
                return this.loadWebsiteTheme(fileId);
              case 2:
                themeLoaded = _context9.v;
                if (!themeLoaded) {
                  _context9.n = 3;
                  break;
                }
                this.options.themeStyle = 'website';
                return _context9.a(2, true);
              case 3:
                this.options.themeStyle = 'default';
                this.websiteTheme = null;
                this.createStyles();
                return _context9.a(2, false);
              case 4:
                _context9.n = 6;
                break;
              case 5:
                _context9.p = 5;
                _t6 = _context9.v;
                console.error('❌ Error in auto-detect theme:', _t6);
                this.options.themeStyle = 'default';
                this.websiteTheme = null;
                this.createStyles();
                return _context9.a(2, false);
              case 6:
                return _context9.a(2);
            }
          }, _callee9, this, [[0, 5]]);
        }));
        function autoDetectAndLoadTheme(_x5) {
          return _autoDetectAndLoadTheme.apply(this, arguments);
        }
        return autoDetectAndLoadTheme;
      }()
    }, {
      key: "loadWebsiteTheme",
      value: function () {
        var _loadWebsiteTheme = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(fileId) {
          var timestamp, response, data, _t7;
          return _regenerator().w(function (_context0) {
            while (1) switch (_context0.p = _context0.n) {
              case 0:
                _context0.p = 0;
                timestamp = new Date().getTime();
                _context0.n = 1;
                return fetch("".concat(this.baseUrl, "/theme/").concat(fileId, "?t=").concat(timestamp), {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                  }
                });
              case 1:
                response = _context0.v;
                _context0.n = 2;
                return response.json();
              case 2:
                data = _context0.v;
                if (!(data.success && data.data && data.data.colors)) {
                  _context0.n = 3;
                  break;
                }
                this.websiteTheme = data.data;
                this.createStyles();
                return _context0.a(2, true);
              case 3:
                return _context0.a(2, false);
              case 4:
                _context0.n = 6;
                break;
              case 5:
                _context0.p = 5;
                _t7 = _context0.v;
                console.error('❌ Error loading website theme:', _t7);
                return _context0.a(2, false);
              case 6:
                return _context0.a(2);
            }
          }, _callee0, this, [[0, 5]]);
        }));
        function loadWebsiteTheme(_x6) {
          return _loadWebsiteTheme.apply(this, arguments);
        }
        return loadWebsiteTheme;
      }()
    }, {
      key: "darkenColor",
      value: function darkenColor(color, percent) {
        if (!color || !color.startsWith('#')) return color;
        var hex = color.slice(1);
        var r = parseInt(hex.substr(0, 2), 16);
        var g = parseInt(hex.substr(2, 2), 16);
        var b = parseInt(hex.substr(4, 2), 16);
        var factor = (100 - percent) / 100;
        var newR = Math.round(r * factor);
        var newG = Math.round(g * factor);
        var newB = Math.round(b * factor);
        return "#".concat(newR.toString(16).padStart(2, '0')).concat(newG.toString(16).padStart(2, '0')).concat(newB.toString(16).padStart(2, '0'));
      }
    }, {
      key: "lightenColor",
      value: function lightenColor(color, percent) {
        if (!color || !color.startsWith('#')) return color;
        var hex = color.slice(1);
        var r = parseInt(hex.substr(0, 2), 16);
        var g = parseInt(hex.substr(2, 2), 16);
        var b = parseInt(hex.substr(4, 2), 16);
        var factor = percent / 100;
        var newR = Math.round(r + (255 - r) * factor);
        var newG = Math.round(g + (255 - g) * factor);
        var newB = Math.round(b + (255 - b) * factor);
        return "#".concat(newR.toString(16).padStart(2, '0')).concat(newG.toString(16).padStart(2, '0')).concat(newB.toString(16).padStart(2, '0'));
      }
    }, {
      key: "adjustColorBrightness",
      value: function adjustColorBrightness(hex, percent) {
        if (!hex || !hex.startsWith('#')) return hex;
        hex = hex.replace('#', '');
        var num = parseInt(hex, 16);
        var amt = Math.round(2.55 * percent);
        var R = (num >> 16) + amt;
        var G = (num >> 8 & 0x00FF) + amt;
        var B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
      }
    }]);
  }();

  // Auto-initialization function
  function initializeChatBot() {
    // Find the script tag that loaded this SDK
    var scripts = document.querySelectorAll('script[data-api-key]');
    var currentScript = scripts[scripts.length - 1]; // Get the last script with data-api-key

    if (!currentScript) {
      console.error('ChatBot SDK: No script tag found with data-api-key attribute');
      return;
    }
    var apiKey = currentScript.getAttribute('data-api-key');
    if (!apiKey) {
      console.error('ChatBot SDK: API key is required. Add data-api-key="YOUR_API_KEY" to the script tag.');
      return;
    }
    console.log('🔧 Initializing ChatBot SDK with API-only configuration...');

    // Only get baseUrl from data attributes - everything else comes from API
    var config = {
      baseUrl: currentScript.getAttribute('data-base-url') || undefined
    };

    // Initialize the chatbot
    try {
      var chatbot = new ChatBot(apiKey, config);

      // Make chatbot globally accessible
      window.ChatFlowAI = chatbot;

      // Dispatch ready event
      var event = new CustomEvent('chatflow-ready', {
        detail: {
          chatbot: chatbot
        }
      });
      document.dispatchEvent(event);
      console.log('ChatFlow AI SDK initialized successfully - all settings loaded from API');
    } catch (error) {
      console.error('ChatBot SDK: Failed to initialize:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatBot);
  } else {
    // DOM is already ready
    initializeChatBot();
  }

  // Log initialization method
  console.log('📦 ChatFlow AI SDK loaded - Configuration will be fetched from API');

  exports.ChatBot = ChatBot;
  exports.default = ChatBot;
  exports.initializeChatBot = initializeChatBot;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=chatbot-sdk.js.map
