"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RApolloProvider = exports.generateApolloClient = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("@apollo/client");
const ws_1 = require("@apollo/client/link/ws");
const utilities_1 = require("@apollo/client/utilities");
function generateApolloClient({ auth, gqlEndpoint, headers, publicRole = "public", cache, connectToDevTools = false, onError }) {
    const wsUri = gqlEndpoint.startsWith("https")
        ? gqlEndpoint.replace(/^https/, "wss")
        : gqlEndpoint.replace(/^http/, "ws");
    const getheaders = (auth) => {
        // add headers
        const resHeaders = Object.assign({}, headers);
        // add auth headers if signed in
        // or add 'public' role if not signed in
        if (auth) {
            if (auth.isAuthenticated()) {
                resHeaders["Authorization"] = `Bearer ${auth.getJWTToken()}`;
                resHeaders["X-Hasura-User-Id"] = `${auth.getUserId()}`;
                resHeaders["X-Hasura-Role"] = "user";
            }
            else {
                resHeaders["X-Hasura-Role"] = publicRole;
            }
        }
        else {
            resHeaders["X-Hasura-Role"] = publicRole;
        }
        //resHeaders["X-Hasura-Allowed-Roles"] = headers && headers["X-Hasura-Allowed-Roles"] ? headers["X-Hasura-Allowed-Roles"] : ["user", "public"]
        // resHeaders["X-Hasura-Default-Role"] = resHeaders["X-Hasura-Default-Role"] ? resHeaders["X-Hasura-Default-Role"] : "user"
        return resHeaders;
    };
    const authHeaders = getheaders(auth);
    const authLink = new client_1.ApolloLink((operation, forward) => {
        operation.setContext(({ headers }) => ({ headers: Object.assign({}, authHeaders) }));
        return forward(operation);
    });
    const ssr = typeof window === "undefined";
    // create ws link
    const wsLink = !ssr
        ? new ws_1.WebSocketLink({
            uri: wsUri,
            options: {
                reconnect: true,
                lazy: true,
                connectionParams: () => {
                    const connectionHeaders = getheaders(auth);
                    return {
                        headers: connectionHeaders,
                    };
                },
            },
        })
        : null;
    // Create an http link:
    const httpLink = new client_1.HttpLink({
        uri: gqlEndpoint
    });
    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    if (wsLink && typeof wsLink !== 'undefined') {
        const link = (0, client_1.split)(
        // split based on operation type
        ({ query }) => {
            const definition = (0, utilities_1.getMainDefinition)(query);
            return (definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription');
        }, wsLink, authLink.concat(httpLink));
        const client = new client_1.ApolloClient({
            link: (0, client_1.from)([link]),
            cache: new client_1.InMemoryCache(),
        });
        return { client, wsLink };
    }
    else {
        throw new Error('gqlEndpoint not provided');
    }
}
exports.generateApolloClient = generateApolloClient;
class RApolloProvider extends react_1.Component {
    constructor(props) {
        super(props);
        const { auth, gqlEndpoint, headers, publicRole = "public", cache, connectToDevTools, onError, } = this.props;
        const { client, wsLink } = generateApolloClient({
            auth,
            gqlEndpoint,
            headers,
            publicRole,
            cache,
            connectToDevTools,
            onError,
        });
        this.client = client;
        this.wsLink = wsLink;
    }
    render() {
        return ((0, jsx_runtime_1.jsx)(client_1.ApolloProvider, { client: this.client, children: this.props.children }));
    }
}
exports.RApolloProvider = RApolloProvider;
