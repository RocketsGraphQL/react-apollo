"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateApolloClient = generateApolloClient;
exports.RApolloProvider = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _client = require("@apollo/client");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var defaultOptions = {
  watchQuery: {
    fetchPolicy: "cache-and-network"
  }
};

function generateApolloClient(_ref) {
  var auth = _ref.auth,
      gqlEndpoint = _ref.gqlEndpoint,
      headers = _ref.headers,
      _ref$publicRole = _ref.publicRole,
      publicRole = _ref$publicRole === void 0 ? "public" : _ref$publicRole,
      cache = _ref.cache,
      _ref$connectToDevTool = _ref.connectToDevTools,
      connectToDevTools = _ref$connectToDevTool === void 0 ? false : _ref$connectToDevTool,
      onError = _ref.onError;

  var getheaders = function getheaders(auth) {
    var resHeaders = _objectSpread({}, headers);

    if (auth) {
      if (auth.isAuthenticated()) {
        resHeaders.authorization = "Bearer ".concat(auth.getJWTToken());
        console.log(resHeaders);
      } else {
        resHeaders.role = publicRole;
      }
    }

    return resHeaders;
  };

  var authHeaders = getheaders(auth);
  var authLink = new _client.ApolloLink(function (operation, forward) {
    operation.setContext(function (_ref2) {
      var headers = _ref2.headers;
      return {
        headers: _objectSpread(_objectSpread({}, authHeaders), headers)
      };
    });
    return forward(operation);
  });
  var client = new _client.ApolloClient({
    link: (0, _client.from)([authLink, new _client.HttpLink({
      uri: gqlEndpoint
    })]),
    cache: new _client.InMemoryCache()
  });
  return client;
}

var RApolloProvider = function (_React$Component) {
  (0, _inherits2["default"])(RApolloProvider, _React$Component);

  var _super = _createSuper(RApolloProvider);

  function RApolloProvider(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, RApolloProvider);
    _this = _super.call(this, props);
    var _this$props = _this.props,
        auth = _this$props.auth,
        gqlEndpoint = _this$props.gqlEndpoint,
        headers = _this$props.headers,
        _this$props$publicRol = _this$props.publicRole,
        publicRole = _this$props$publicRol === void 0 ? "public" : _this$props$publicRol,
        cache = _this$props.cache,
        connectToDevTools = _this$props.connectToDevTools,
        onError = _this$props.onError;
    console.log(_this.props);
    var client = generateApolloClient({
      auth: auth,
      gqlEndpoint: gqlEndpoint,
      headers: headers,
      publicRole: publicRole,
      cache: cache,
      connectToDevTools: connectToDevTools,
      onError: onError
    });
    _this.client = client;
    return _this;
  }

  (0, _createClass2["default"])(RApolloProvider, [{
    key: "render",
    value: function render() {
      return _react["default"].createElement(_client.ApolloProvider, {
        client: this.client
      }, this.props.children);
    }
  }]);
  return RApolloProvider;
}(_react["default"].Component);

exports.RApolloProvider = RApolloProvider;